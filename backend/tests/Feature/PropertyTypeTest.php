<?php

namespace Tests\Feature;

use App\Models\City;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PropertyTypeTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(
            Role::firstOrCreate(['name' => $role], ['is_active' => true]),
            ['uuid' => (string) Str::uuid()]
        );

        return $user;
    }

    private function privateType(User $owner, string $name): PropertyType
    {
        $type = new PropertyType(['name' => $name]);
        $type->user_id = $owner->id;
        $type->save();

        return $type;
    }

    public function test_admin_manages_global_types(): void
    {
        $this->actingAs($this->userWithRole('SYSTEM_ADMIN'));

        $uuid = $this->postJson('/api/property-types', ['name' => 'Glamping', 'icon' => 'tent'])
            ->assertCreated()->assertJsonPath('data.is_active', true)->assertJsonPath('data.user_id', null)
            ->json('data.uuid');
        $this->postJson('/api/property-types', ['name' => 'Glamping'])->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->patchJson("/api/property-types/{$uuid}", ['name' => 'Glamping', 'is_active' => false])->assertOk();

        $this->getJson('/api/public/property-types')->assertOk()->assertJsonMissing(['name' => 'Glamping']);
    }

    public function test_only_admin_reaches_the_admin_crud(): void
    {
        $this->actingAs($this->userWithRole('ANFITRION'))
            ->postJson('/api/property-types', ['name' => 'Glamping'])->assertForbidden();
    }

    public function test_host_creates_a_private_type_that_only_they_see(): void
    {
        PropertyType::factory()->create(['name' => 'Casa']);
        $host = $this->userWithRole('ANFITRION');
        $otherHost = $this->userWithRole('ANFITRION');

        $this->actingAs($host)->postJson('/api/host/property-types', ['name' => 'Casa campestre'])
            ->assertCreated()->assertJsonPath('data.user_id', $host->id);
        $this->getJson('/api/host/property-types')->assertOk()->assertJsonCount(2, 'data');

        $this->actingAs($otherHost)->getJson('/api/host/property-types')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonMissing(['name' => 'Casa campestre']);
        $this->getJson('/api/public/property-types')->assertJsonMissing(['name' => 'Casa campestre']);
    }

    public function test_host_cannot_repeat_a_global_or_own_name_ignoring_case(): void
    {
        PropertyType::factory()->create(['name' => 'Casa']);
        $host = $this->userWithRole('ANFITRION');
        $this->privateType($host, 'Casa campestre');

        $this->actingAs($host)->postJson('/api/host/property-types', ['name' => ' casa '])
            ->assertUnprocessable()->assertJsonValidationErrors(['name' => 'Ya existe un tipo de propiedad con ese nombre.']);
        $this->postJson('/api/host/property-types', ['name' => 'CASA CAMPESTRE'])->assertUnprocessable();

        // Otro anfitrión sí puede tener su propio "Casa campestre".
        $this->actingAs($this->userWithRole('ANFITRION'))
            ->postJson('/api/host/property-types', ['name' => 'Casa campestre'])->assertCreated();
    }

    public function test_host_edits_only_their_own_types(): void
    {
        $global = PropertyType::factory()->create(['name' => 'Casa']);
        $host = $this->userWithRole('ANFITRION');
        $own = $this->privateType($host, 'Casa campestre');
        $foreign = $this->privateType($this->userWithRole('ANFITRION'), 'Chalet');

        $this->actingAs($host)->patchJson("/api/host/property-types/{$own->uuid}", ['name' => 'Casa de campo'])
            ->assertOk()->assertJsonPath('data.name', 'Casa de campo');
        $this->patchJson("/api/host/property-types/{$own->uuid}", ['name' => 'Casa de campo'])->assertOk();
        $this->patchJson("/api/host/property-types/{$global->uuid}", ['name' => 'Mi casa'])->assertForbidden();
        $this->patchJson("/api/host/property-types/{$foreign->uuid}", ['name' => 'Mi chalet'])->assertForbidden();

        $this->assertSame('Casa', $global->fresh()->name);
    }

    public function test_property_accepts_global_and_own_types_but_not_foreign_ones(): void
    {
        Storage::fake('public');
        $host = $this->userWithRole('ANFITRION');
        $payload = fn (PropertyType $type) => [
            'name' => 'Casa', 'description' => 'Casa de prueba', 'property_type_id' => $type->id, 'address' => 'Calle 1',
            'city_id' => City::factory()->create()->id, 'max_guests' => 2, 'price' => 150000,
            'images' => [UploadedFile::fake()->image('casa.jpg')],
        ];

        $this->actingAs($host);
        $this->postJson('/api/property', $payload(PropertyType::factory()->create()))->assertCreated();
        $this->postJson('/api/property', $payload($this->privateType($host, 'Casa campestre')))
            ->assertCreated()->assertJsonPath('data.property_type', 'Casa campestre');
        $this->postJson('/api/property', $payload($this->privateType($this->userWithRole('ANFITRION'), 'Chalet')))
            ->assertUnprocessable()->assertJsonValidationErrors('property_type_id');

        $this->assertSame(2, Property::count());
    }
}
