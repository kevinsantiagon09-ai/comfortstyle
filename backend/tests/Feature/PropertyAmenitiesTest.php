<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\City;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PropertyAmenitiesTest extends TestCase
{
    use RefreshDatabase;

    private function host(): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(Role::factory()->create(), ['uuid' => (string) Str::uuid()]);

        return $user;
    }

    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'Casa', 'description' => 'Casa de prueba', 'property_type' => 'Casa', 'address' => 'Calle 1',
            'city_id' => City::factory()->create()->id, 'max_guests' => 2, 'price' => 150000,
            'images' => [UploadedFile::fake()->image('casa.jpg')], ...$overrides,
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_lists_only_active_amenities(): void
    {
        Amenity::create(['name' => 'WiFi', 'category' => 'Básicos']);
        Amenity::create(['name' => 'Sauna', 'category' => 'Exteriores', 'is_active' => false]);

        $this->getJson('/api/public/amenities')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'WiFi');
    }

    public function test_the_same_amenity_can_be_attached_to_several_properties(): void
    {
        $wifi = Amenity::create(['name' => 'WiFi']);
        $pool = Amenity::create(['name' => 'Piscina']);
        $this->actingAs($this->host());

        $this->postJson('/api/property', $this->payload(['amenities' => [$wifi->id, $pool->id]]))
            ->assertCreated()->assertJsonCount(2, 'data.amenities');
        $this->postJson('/api/property', $this->payload(['amenities' => [$wifi->id]]))
            ->assertCreated()->assertJsonPath('data.amenities.0.name', 'WiFi');
        $this->postJson('/api/property', $this->payload())->assertCreated()->assertJsonCount(0, 'data.amenities');
    }

    public function test_rejects_unknown_or_inactive_amenities(): void
    {
        $inactive = Amenity::create(['name' => 'Sauna', 'is_active' => false]);
        $this->actingAs($this->host());

        $this->postJson('/api/property', $this->payload(['amenities' => [999]]))->assertUnprocessable()->assertJsonValidationErrors('amenities.0');
        $this->postJson('/api/property', $this->payload(['amenities' => [$inactive->id]]))->assertUnprocessable()->assertJsonValidationErrors('amenities.0');
    }

    public function test_host_can_edit_the_property_and_its_amenities(): void
    {
        $wifi = Amenity::create(['name' => 'WiFi']);
        $pool = Amenity::create(['name' => 'Piscina']);
        $this->actingAs($this->host());
        $id = $this->postJson('/api/property', $this->payload(['amenities' => [$wifi->id]]))->json('data.id');

        $this->patchJson("/api/property/{$id}", ['name' => 'Casa renovada', 'price' => '200000', 'amenities' => [$pool->id]])
            ->assertOk()
            ->assertJsonPath('data.name', 'Casa renovada')
            ->assertJsonPath('data.price', '200000.00')
            ->assertJsonCount(1, 'data.amenities')
            ->assertJsonPath('data.amenities.0.name', 'Piscina');
        $this->patchJson("/api/property/{$id}", ['amenities' => []])->assertOk()->assertJsonCount(0, 'data.amenities');
        $this->getJson("/api/property/{$id}")->assertOk()->assertJsonStructure(['data' => ['department_id']]);
    }
}
