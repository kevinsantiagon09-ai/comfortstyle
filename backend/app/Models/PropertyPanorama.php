<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class PropertyPanorama extends Model
{
    protected $fillable = [
        'uuid',
        'property_id',
        'title',
        'image_path',
        'preview_path',
        'display_order',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (PropertyPanorama $panorama): void {
            $panorama->uuid ??= (string) Str::uuid();
        });
    }

    /**
     * Propiedad a la que pertenece este panorama.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class, 'property_id');
    }
}
