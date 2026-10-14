<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PropertyCoordinatesTest extends TestCase
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
            'city_id' => City::factory()->create()->id, 'max_guests' => 2, 'price' => 1500000,
            'images' => [UploadedFile::fake()->image('casa.jpg')], ...$overrides,
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_host_saves_the_map_location_and_guests_receive_it(): void
    {
        $this->actingAs($this->host());
        $uuid = $this->postJson('/api/property', $this->payload(['latitude' => 4.711, 'longitude' => -74.0721]))
            ->assertCreated()
            ->assertJsonPath('data.latitude', '4.7110000')
            ->json('data.uuid');

        $this->getJson('/api/public/properties/'.$uuid)
            ->assertOk()
            ->assertJsonPath('data.longitude', '-74.0721000');
    }

    public function test_coordinates_are_optional_but_must_come_in_pairs_and_in_range(): void
    {
        $this->actingAs($this->host());
        $this->postJson('/api/property', $this->payload())->assertCreated()->assertJsonPath('data.latitude', null);
        $this->postJson('/api/property', $this->payload(['latitude' => 4.7]))->assertJsonValidationErrors('longitude');
        $this->postJson('/api/property', $this->payload(['latitude' => 95, 'longitude' => 10]))->assertJsonValidationErrors('latitude');
    }
}
