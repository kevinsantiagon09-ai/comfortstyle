<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\LocationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PropertyAccessAndLocationTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $name, bool $active = true): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['name' => $name, 'is_active' => $active]);
        $user->roles()->attach($role, ['uuid' => (string) Str::uuid()]);

        return $user;
    }

    public function test_cities_are_filtered_by_department(): void
    {
        $city = City::factory()->create();
        $other = City::factory()->create();
        $this->getJson('/api/public/departments')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/public/departments/'.$city->department_id.'/cities')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $city->id);
        $this->getJson('/api/public/departments/999999/cities')->assertNotFound();
    }

    public function test_management_requires_authentication_and_active_host_role(): void
    {
        $this->getJson('/api/property')->assertUnauthorized();
        foreach ([['HUESPED', true], ['ANFITRION', false]] as [$role, $active]) {
            $this->actingAs($this->userWithRole($role, $active))->getJson('/api/property')->assertForbidden();
        }
    }

    public function test_host_only_lists_and_changes_own_properties(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $own = Property::factory()->create(['user_id' => $host->id]);
        $other = Property::factory()->create();
        $this->actingAs($host)->getJson('/api/property')->assertOk()->assertJsonCount(1, 'data.data')->assertJsonPath('data.data.0.id', $own->id);
        $this->getJson('/api/property/'.$other->uuid)->assertForbidden();
        $this->patchJson('/api/property/'.$other->uuid, ['name' => 'Changed'])->assertForbidden();
        $this->patchJson('/api/property/'.$own->uuid, ['name' => 'Updated'])->assertOk();
        $this->patchJson('/api/property/'.$own->uuid, ['user_id' => $other->user_id])->assertUnprocessable();
    }

    public function test_property_creation_uses_session_owner_and_valid_city(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $city = City::factory()->create();
        Storage::fake('public');
        $data = ['name' => 'Casa', 'description' => 'Casa de prueba', 'property_type' => 'Casa', 'address' => 'Calle 1', 'city_id' => $city->id, 'max_guests' => 2, 'price' => 100, 'images' => [UploadedFile::fake()->image('casa.jpg')]];
        $this->actingAs($host)->postJson('/api/property', $data)->assertCreated()->assertJsonPath('data.user_id', $host->id)->assertJsonPath('data.city', $city->name)->assertJsonPath('data.department', $city->department->name);
        $this->postJson('/api/property', [...$data, 'city_id' => 999999])->assertUnprocessable();
        $this->postJson('/api/property', [...$data, 'user_id' => $host->id])->assertUnprocessable();
    }

    public function test_property_is_registered_complete_and_published_with_its_photos(): void
    {
        Storage::fake('public');
        $host = $this->userWithRole('ANFITRION');
        $data = ['name' => 'Casa', 'description' => 'Casa de prueba', 'property_type' => 'Casa', 'address' => 'Calle 1', 'city_id' => City::factory()->create()->id, 'max_guests' => 2, 'price' => 100];

        $this->actingAs($host)->postJson('/api/property', $data)->assertUnprocessable()->assertJsonValidationErrors('images');
        $this->postJson('/api/property', [...$data, 'images' => [UploadedFile::fake()->create('doc.pdf', 10, 'application/pdf')]])->assertUnprocessable()->assertJsonValidationErrors('images.0');
        $this->assertDatabaseCount('properties', 0);

        $response = $this->postJson('/api/property', [...$data, 'images' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.png')]])
            ->assertCreated()->assertJsonPath('data.is_active', true)->assertJsonCount(2, 'data.images')
            ->assertJsonPath('data.images.0.is_cover', true)->assertJsonPath('data.images.1.is_cover', false);
        Storage::disk('public')->assertExists($response->json('data.images.1.image_path'));
    }

    public function test_wizard_steps_are_validated_by_the_backend_without_saving(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $precognitive = fn (string $fields) => ['Precognition' => 'true', 'Precognition-Validate-Only' => $fields];

        $this->actingAs($host)->postJson('/api/property', ['name' => '', 'city_id' => 999999], $precognitive('name,description,property_type'))
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'description', 'property_type'])->assertJsonMissingValidationErrors('city_id');
        $this->postJson('/api/property', ['name' => 'Casa', 'description' => 'Linda', 'property_type' => 'Casa'], $precognitive('name,description,property_type'))
            ->assertNoContent()->assertHeader('Precognition-Success', 'true');
        $this->assertDatabaseCount('properties', 0);
    }

    public function test_public_catalog_preserves_location_names_and_hides_inactive_properties(): void
    {
        $property = Property::factory()->create();
        $inactive = Property::factory()->create(['is_active' => false]);
        $this->getJson('/api/public/properties')->assertOk()->assertJsonCount(1, 'data.data')->assertJsonPath('data.data.0.city', $property->city);
        $this->getJson('/api/public/properties/'.$inactive->uuid)->assertNotFound();
    }

    public function test_host_cannot_access_other_hosts_images(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $property = Property::factory()->create();
        $image = $property->images()->create(['image_path' => 'test.jpg']);
        $this->actingAs($host)->getJson('/api/property-images?property_id='.$property->id)->assertForbidden();
        $this->getJson('/api/property-images/'.$image->id)->assertForbidden();
        $this->patchJson('/api/property-images/'.$image->id, ['caption' => 'Changed'])->assertForbidden();
    }

    public function test_only_administrator_can_access_administration(): void
    {
        foreach (['roles', 'users', 'estados'] as $route) {
            $this->getJson('/api/'.$route)->assertUnauthorized();
        }
        $this->actingAs($this->userWithRole('ANFITRION'))->getJson('/api/roles')->assertForbidden();
        $this->actingAs($this->userWithRole('SYSTEM_ADMIN'))->getJson('/api/roles')->assertOk();
    }

    public function test_location_seed_is_repeatable_and_has_valid_relationships(): void
    {
        $this->seed(LocationSeeder::class);
        $this->seed(LocationSeeder::class);
        $this->assertDatabaseCount('departments', 33);
        $this->assertDatabaseCount('cities', 1122);
        $city = City::where('code', '05001')->firstOrFail();
        $this->assertSame('05', $city->department->code);
    }

    public function test_administrator_can_list_users_and_public_registration_cannot_assign_admin(): void
    {
        $this->actingAs($this->userWithRole('SYSTEM_ADMIN'))->getJson('/api/users')->assertOk();
        $this->postJson('/register', ['name' => 'Test', 'email' => 'test@example.org', 'password' => 'Password123', 'password_confirmation' => 'Password123', 'role' => 'SYSTEM_ADMIN'])->assertUnprocessable()->assertJsonValidationErrors('role');
    }

    public function test_host_cannot_upload_to_another_property_or_move_an_image(): void
    {
        $host = $this->userWithRole('ANFITRION');
        $own = Property::factory()->create(['user_id' => $host->id]);
        $other = Property::factory()->create();
        $image = $own->images()->create(['image_path' => 'test.jpg']);
        $this->actingAs($host)->patchJson('/api/property-images/'.$image->id, ['property_id' => $other->id])->assertUnprocessable();
        $this->postJson('/api/property-images', ['property_id' => $other->id, 'image' => UploadedFile::fake()->image('image.jpg')])->assertForbidden();
    }
}
