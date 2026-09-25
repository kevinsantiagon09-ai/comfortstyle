<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Override;

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
        return[
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

    public function property(): BelongsTo
    {
        return $this->belongsTo(
            Property::class,
            'property_id'
        );
    }
    
}

