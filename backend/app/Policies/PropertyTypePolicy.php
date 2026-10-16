<?php

namespace App\Policies;

use App\Models\PropertyType;
use App\Models\User;

class PropertyTypePolicy
{
    /** El anfitrión solo edita los tipos que creó; los globales son del administrador. */
    public function update(User $user, PropertyType $propertyType): bool
    {
        return $user->hasRole('ANFITRION') && $propertyType->user_id === $user->id;
    }
}
