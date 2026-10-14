<?php

namespace Tests\Feature;

use App\Models\Property;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicPropertyMapTest extends TestCase
{
    use RefreshDatabase;

    public function test_map_lists_only_published_properties_with_coordinates(): void
    {
        $visible = Property::factory()->create(['latitude' => 4.5338890, 'longitude' => -75.6811110]);
        Property::factory()->create(['latitude' => 6.2442030, 'longitude' => -75.5812110, 'is_active' => false]);
        Property::factory()->create();

        $this->getJson('/api/public/properties/map')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.uuid', $visible->uuid)
            ->assertJsonPath('data.0.latitude', '4.5338890')
            ->assertJsonStructure(['data' => [['uuid', 'name', 'price', 'currency', 'latitude', 'longitude', 'city', 'department', 'cover_path']]]);
    }
}
