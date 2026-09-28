<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UsersService
{
    public function getAll(int $perPage = 20, string $search = ''): LengthAwarePaginator
    {
        return User::query()
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $query->whereLike('name', "%{$search}%")->orWhereLike('email', "%{$search}%");
            }))
            ->latest()->paginate($perPage);
    }

    public function create(array $userData)
    {
        return User::create($userData);
    }

    public function getUserRoles($userId)
    {
        $user = User::find($userId);

        if (! $user) {
            return null; // or throw an exception
        }

        return $user->roles()->get();
    }

    // Crear usuario y asignarle roles
    public function createUserWithRoles(array $userData, array $roleIds)
    {
        $user = User::create($userData);
        $user->roles()->attach($roleIds);

        return $user;
    }
}
