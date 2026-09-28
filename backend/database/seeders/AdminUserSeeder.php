<?php

namespace Database\Seeders;

use App\Models\Estado;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Crea el administrador del sistema: el único usuario que ingresa por seeder.
 * Requiere RoleSeeder y EstadoSeeder.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $config = config('auth.admin');
        $role = Role::where('name', RoleSeeder::SYSTEM_ADMIN)->firstOrFail();
        $activo = Estado::activo();

        $user = User::firstOrNew(['email' => strtolower(trim($config['email']))]);

        if (! $user->exists) {
            if (strlen((string) $config['password']) < 8) {
                throw new RuntimeException('Define ADMIN_PASSWORD (mínimo 8 caracteres) en el .env para crear el administrador.');
            }

            $user->fill([
                'name' => $config['name'],
                'password' => $config['password'],
            ]);
        }

        $user->status_id = $activo->id;
        $user->save();

        if (! $user->roles()->whereKey($role->id)->exists()) {
            $user->roles()->attach($role->id, [
                'uuid' => (string) Str::uuid(),
                'assigned_at' => now(),
            ]);
        }
    }
}
