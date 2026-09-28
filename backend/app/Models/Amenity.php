<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Amenity extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'category',
        'description',
        'icon',
        'is_active',
    ];

    protected $hidden = ['pivot'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Amenity $amenity): void {
            $amenity->uuid ??= (string) Str::uuid();
        });
    }

    public function properties(): BelongsToMany
    {
        return $this->belongsToMany(Property::class)->withTimestamps();
    }
}
