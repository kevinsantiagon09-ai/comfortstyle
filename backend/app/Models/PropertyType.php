<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PropertyType extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'description',
        'icon',
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
        static::creating(function (PropertyType $type): void {
            $type->uuid ??= (string) Str::uuid();
        });
    }

    /** Anfitrión dueño del tipo; nulo en los tipos globales del administrador. */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }

    /** Tipos que puede usar el anfitrión: los globales y los suyos. */
    public function scopeVisibleTo(Builder $query, int $userId): void
    {
        $query->where(fn (Builder $visible) => $visible->whereNull('user_id')->orWhere('user_id', $userId));
    }

    /** Busca un nombre sin distinguir mayúsculas ni espacios en los extremos. */
    public function scopeNamed(Builder $query, string $name): void
    {
        $query->whereRaw('lower(name) = ?', [mb_strtolower(trim($name))]);
    }
}
