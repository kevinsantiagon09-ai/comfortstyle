<?php

namespace App\Services\Auth;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $role = Role::query()
                ->where('name', $data['role'])
                ->where('is_active', true)
                ->first();

            if ($role === null) {
                throw ValidationException::withMessages([
                    'role' => ['El tipo de cuenta seleccionado no está disponible.'],
                ]);
            }

            unset(
                $data['role'],
                $data['password_confirmation']
            );

            $data['password'] = Hash::make(
                $data['password']
            );

            $user = User::create($data);

            $user->roles()->attach($role->id, [
                'assigned_at' => now(),
            ]);

            Auth::login($user);

            request()->session()->regenerate();

            return $user->load('roles');
        });
    }

    public function login(array $credentials): User
    {
        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => [
                    'Las credenciales son incorrectas.',
                ],
            ]);
        }

        request()->session()->regenerate();

        return Auth::user()->load('roles');
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}
