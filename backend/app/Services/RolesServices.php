<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class RolesServices
{
    public function getActiveRoles(): Collection
    {
        return Role::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    public function create(array $data): Role
    {
        return Role::create($data);
    }

    public function update(Role $role, array $data): Role
    {
        $role->update($data);

        return $role->fresh();
    }

    public function delete(Role $role): void
    {
        if ($role->name === 'SYSTEM_ADMIN') {
            throw ValidationException::withMessages([
                'role' => [
                    'El rol principal del sistema no puede eliminarse.',
                ],
            ]);
        }

        $role->delete();
    }
}
