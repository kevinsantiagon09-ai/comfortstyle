<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Estado extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'codigo',
        'nombre',
        'modulo',
        'descripcion',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Estado $estado) {
            $estado->uuid ??= (string) Str::uuid();
        });
    }
}
