<?php

namespace App\Policies;

use App\Models\Property;
use App\Models\User;

class PropertyPolicy
{
    public function view(User $user, Property $property): bool
    {
        return $user->hasRole('ANFITRION') && $user->id === $property->user_id;
    }

    public function update(User $user, Property $property): bool
    {
        return $this->view($user, $property);
    }
}
