<?php

namespace Tests\Feature;

use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use RuntimeException;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth.admin' => ['name' => 'Admin', 'email' => 'admin@comfortstyle.test', 'password' => 'Secreto123']]);
    }

    public function test_seeds_catalogs_and_only_the_system_administrator(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->assertEqualsCanonicalizing(['SYSTEM_ADMIN', 'ANFITRION', 'HUESPED'], Role::pluck('name')->all());
        $this->assertDatabaseHas('estados', ['descripcion' => 'ACTIVO', 'is_active' => true]);
        $this->assertDatabaseCount('users', 1);

        $admin = User::firstOrFail();
        $this->assertNotNull($admin->uuid);
        $this->assertSame('ACTIVO', $admin->status->descripcion);
        $this->assertTrue($admin->hasRole('SYSTEM_ADMIN'));
        $this->assertSame(['SYSTEM_ADMIN'], $admin->roles->pluck('name')->all());
    }

    public function test_seeding_again_duplicates_nothing_and_keeps_the_admin_password(): void
    {
        $this->seed(DatabaseSeeder::class);
        config(['auth.admin.password' => 'OtraClave456']);
        $this->seed(DatabaseSeeder::class);

        $this->assertDatabaseCount('roles', 3);
        $this->assertDatabaseCount('estados', 2);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('user_roles', 1);
        $this->assertTrue(Hash::check('Secreto123', User::firstOrFail()->password));
    }

    public function test_admin_can_log_in_and_reach_administration(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->postJson('/login', ['email' => 'admin@comfortstyle.test', 'password' => 'Secreto123'])->assertOk();
        $this->getJson('/api/roles')->assertOk();
    }

    public function test_seeded_roles_allow_public_registration(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->postJson('/register', ['name' => 'Ana', 'email' => 'ana@example.org', 'password' => 'Password123', 'password_confirmation' => 'Password123', 'role' => 'HUESPED'])
            ->assertCreated();
    }

    public function test_requires_an_admin_password(): void
    {
        config(['auth.admin.password' => null]);

        $this->expectException(RuntimeException::class);
        $this->seed(DatabaseSeeder::class);
    }
}
