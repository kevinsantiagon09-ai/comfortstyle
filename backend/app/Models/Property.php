<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;


class Property extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
         'uuid',
        'user_id',
        'name',
        'description',
        'property_type',
        'address',
        'department',
        'city',
        'latitude',
        'longitude',
        'max_guests',
        'bathrooms',
        'bedrooms',
        'beds',
        'base_price',
        'currency',
        'check_in_time',
        'check_out_time',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'max_guests' => 'integer',
            'bathrooms' => 'integer',
            'bedrooms' => 'integer',
            'beds' => 'integer',
            'base_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Property $property) {
            $property->uuid ??= (string)Str::uuid();
        });
    }

    public function host() :BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}


