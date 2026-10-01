<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Reservation extends Model
{
    public const CONFIRMADA = 'CONFIRMADA';

    public const CANCELADA = 'CANCELADA';

    protected $fillable = [
        'uuid',
        'property_id',
        'user_id',
        'check_in',
        'check_out',
        'guests',
        'nights',
        'price_per_night',
        'total_price',
        'currency',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date:Y-m-d',
            'check_out' => 'date:Y-m-d',
            'guests' => 'integer',
            'nights' => 'integer',
            'price_per_night' => 'decimal:2',
            'total_price' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Reservation $reservation) {
            $reservation->uuid ??= (string) Str::uuid();
        });
    }

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function guest(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Reservas vigentes que se cruzan con el rango [checkIn, checkOut). */
    public function scopeOverlapping(Builder $query, string $checkIn, string $checkOut): void
    {
        $query->where('status', '!=', self::CANCELADA)
            ->where('check_in', '<', $checkOut)
            ->where('check_out', '>', $checkIn);
    }
}
