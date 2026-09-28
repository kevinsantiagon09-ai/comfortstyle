<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PropertyImage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'property_id',
        'image_path',
        'caption',
        'is_cover',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_cover' => 'boolean',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (
            PropertyImage $propertyImage
        ): void {
            $propertyImage->uuid ??= (string) Str::uuid();
        });
    }

    /**
     * Propiedad a la que pertenece esta imagen.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(
            Property::class,
            'property_id'
        );
    }
}


