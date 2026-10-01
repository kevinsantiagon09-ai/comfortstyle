<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\PropertyPanorama;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PropertyPanoramaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function userWithRole(string $name): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['name' => $name, 'is_active' => true]);
        $user->roles()->attach($role, ['uuid' => (string) Str::uuid()]);

        return $user;
    }

    private function upload(Property $property, int $width = 4000, int $height = 2000)
    {
        return $this->post('/api/property-panoramas', [
            'property_id' => $property->id,
            'title' => 'Sala',
            'image' => UploadedFile::fake()->image('sala.jpg', $width, $height),
            'preview' => UploadedFile::fake()->image('preview.jpg', 1024, 512),
        ], ['Accept' => 'application/json']);
    }

    public function test_only_the_owner_host_uploads_panoramas(): void
    {
        $property = Property::factory()->create();
        $this->actingAs($this->userWithRole('ANFITRION'));
        $this->upload($property)->assertForbidden();

        $this->actingAs($this->userWithRole('HUESPED'));
        $this->upload($property)->assertForbidden();
    }

    public function test_host_uploads_panorama_in_order_and_it_appears_in_public_detail(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $property = Property::factory()->create(['user_id' => $host->id]);
        $this->actingAs($host);

        $first = $this->upload($property)->assertCreated()->assertJsonPath('data.display_order', 0);
        $this->upload($property)->assertCreated()->assertJsonPath('data.display_order', 1);
        Storage::disk('public')->assertExists([$first->json('data.image_path'), $first->json('data.preview_path')]);

        $this->getJson('/api/property-panoramas?property_id='.$property->id)->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/public/properties/'.$property->id)
            ->assertOk()
            ->assertJsonCount(2, 'data.panoramas')
            ->assertJsonPath('data.panoramas.0.title', 'Sala');
    }

    public function test_rejects_images_that_are_not_360(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $property = Property::factory()->create(['user_id' => $host->id]);
        $this->actingAs($host);

        $this->upload($property, 3000, 2000)->assertJsonValidationErrors('image');
        $this->upload($property, 1000, 500)->assertJsonValidationErrors('image');
    }

    public function test_host_deletes_own_panorama_and_its_file(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $property = Property::factory()->create(['user_id' => $host->id]);
        $this->actingAs($host);
        $panorama = PropertyPanorama::findOrFail($this->upload($property)->json('data.id'));

        $this->actingAs($this->userWithRole('ANFITRION'))->deleteJson('/api/property-panoramas/'.$panorama->id)->assertForbidden();
        $this->actingAs($host)->deleteJson('/api/property-panoramas/'.$panorama->id)->assertOk();

        $this->assertModelMissing($panorama);
        Storage::disk('public')->assertMissing([$panorama->image_path, $panorama->preview_path]);
    }
}
