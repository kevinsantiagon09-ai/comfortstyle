<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Property extends Model
{
    use HasFactory;
    use SoftDeletes;

    /** Máximo admitido por la columna price, decimal(12,2). */
    public const MAX_PRICE = 9999999999.99;

    protected $appends = ['city', 'department', 'department_id'];

    protected $hidden = ['location'];

    public function location(): BelongsTo
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function getCityAttribute(): ?string
    {
        return $this->location?->name;
    }

    public function getDepartmentIdAttribute(): ?int
    {
        return $this->location?->department_id;
    }

    public function getDepartmentAttribute(): ?string
    {
        return $this->location?->department?->name;
    }

    protected $fillable = [
        'uuid',
        'user_id',
        'name',
        'description',
        'property_type',
        'address',
        'city_id',
        'latitude',
        'longitude',
        'max_guests',
        'bathrooms',
        'bedrooms',
        'beds',
        'price',
        'currency',
        'check_in_time',
        'check_out_time',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'max_guests' => 'integer',
            'bathrooms' => 'integer',
            'bedrooms' => 'integer',
            'beds' => 'integer',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Property $property) {
            $property->uuid ??= (string) Str::uuid();
        });
    }

    public function host(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(
            PropertyImage::class,
            'property_id'
        )->orderBy('display_order');
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class)
            ->withTimestamps()
            ->orderBy('category')
            ->orderBy('name');
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }
}
