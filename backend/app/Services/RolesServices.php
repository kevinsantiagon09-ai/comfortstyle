<?php

namespace App\Services;

use App\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\ValidationException;

class RolesServices
{
    public function getAll(): Collection
    {
        return Role::query()
            ->orderBy('name')
            ->get();
    }

    public function getActive(): Collection
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
        $desactivando = array_key_exists('is_active', $data)
            && ! filter_var($data['is_active'], FILTER_VALIDATE_BOOLEAN);

        if ($desactivando && $role->name === 'SYSTEM_ADMIN') {
            throw ValidationException::withMessages([
                'is_active' => [
                    'El rol principal del sistema no puede desactivarse.',
                ],
            ]);
        }

        $role->update($data);

        return $role->fresh();
    }
}
