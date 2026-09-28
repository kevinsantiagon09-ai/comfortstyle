<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Estado extends Model
{
    use SoftDeletes;

    public const ACTIVO = 'ACTIVO';

    protected $fillable = [
        'uuid',
        'descripcion',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /** Estado asignado a las cuentas habilitadas; sin distinguir mayúsculas. */
    public static function activo(): self
    {
        return static::whereRaw('upper(descripcion) = ?', [self::ACTIVO])->orderBy('id')->firstOrFail();
    }

    protected static function booted(): void
    {
        static::creating(function (Estado $estado) {
            $estado->uuid ??= (string) Str::uuid();
        });
    }
}
