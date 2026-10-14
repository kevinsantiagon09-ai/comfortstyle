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

class PropertyPriceTest extends TestCase
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

    public function test_accepts_prices_in_cop_above_one_million(): void
    {
        $this->actingAs($this->host())->postJson('/api/property', $this->payload(['price' => 1500000]))
            ->assertCreated()->assertJsonPath('data.price', '1500000.00');
        $this->postJson('/api/property', $this->payload(['price' => Property::MAX_PRICE]))->assertCreated();
    }

    public function test_price_is_required_and_bounded(): void
    {
        $this->actingAs($this->host());
        $payload = $this->payload();
        unset($payload['price']);

        $this->postJson('/api/property', $payload)->assertUnprocessable()->assertJsonValidationErrors('price');
        $this->postJson('/api/property', $this->payload(['price' => 10000000000]))->assertUnprocessable()->assertJsonValidationErrors('price');
        $this->postJson('/api/property', $this->payload(['price' => 100.123]))->assertUnprocessable()->assertJsonValidationErrors('price');
        $this->postJson('/api/property', $this->payload(['price' => -1]))->assertUnprocessable()->assertJsonValidationErrors('price');
    }

    public function test_update_applies_the_same_limit(): void
    {
        $host = $this->host();
        $property = Property::factory()->create(['user_id' => $host->id]);

        $this->actingAs($host)->patchJson('/api/property/'.$property->uuid, ['price' => 2750000.5])->assertOk()->assertJsonPath('data.price', '2750000.50');
        $this->patchJson('/api/property/'.$property->uuid, ['price' => 10000000000])->assertUnprocessable();
    }
}
