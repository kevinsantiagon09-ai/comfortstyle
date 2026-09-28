<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public const SYSTEM_ADMIN = 'SYSTEM_ADMIN';

    private const ROLES = [
        self::SYSTEM_ADMIN => 'Administrador del sistema.',
        'ANFITRION' => 'Publica y administra alojamientos.',
        'HUESPED' => 'Busca y reserva alojamientos.',
    ];

    public function run(): void
    {
        foreach (self::ROLES as $name => $description) {
            $role = Role::withTrashed()->firstOrNew(['name' => $name]);
            $role->fill(['description' => $description, 'is_active' => true]);
            $role->deleted_at = null;
            $role->save();
        }
    }
}
