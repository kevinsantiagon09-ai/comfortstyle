<?php

namespace App\Services\Auth;

class UsersService
{
    public function create(array $userData)
    {
        return \App\Models\User::create($userData);
    }

    public function getUserRoles($userId)
    {
        $user = \App\Models\User::find($userId);

        if (!$user) {
            return null; // or throw an exception
        }

        return $user->roles()->get();
    }

    //Crear usuario y asignarle roles
    public function createUserWithRoles(array $userData, array $roleIds)
    {
        $user = \App\Models\User::create($userData);
        $user->roles()->attach($roleIds);

        return $user;  
     }  
}