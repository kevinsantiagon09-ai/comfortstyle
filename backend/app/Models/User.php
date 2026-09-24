<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Http\Controllers\Api\RoleController;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable([
    'name',
    'email',
    'password',
    'uuid',
    'first_name',
    'last_name',
    'phone_number',
    'address',
    'city',
    'status_id',    

])]
#[Hidden([
    'password',
    'remember_token',
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Roles asignados al usuario.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(
            RoleController::class,
            'user_roles',
            'user_id',
            'role_id'
        )->withPivot([
            'uuid',
            'assigned_at',
        ]);
    }

//Funcion para generar un UUID único para el usuario antes de guardarlo en la base de datos
    protected static function booted()  
    {
        static::creating(function ($user) {
            $user->uuid = (string) \Illuminate\Support\Str::uuid();
        });
    }

    /**
     * Conversión automática de atributos.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function status()
    {
        return $this->belongsTo(Estado::class, 'status_id');
    }
}
