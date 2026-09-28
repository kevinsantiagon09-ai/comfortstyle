<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class City extends Model
{
    use HasFactory;

    protected $fillable = ['department_id', 'name', 'code'];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function properties(): HasMany
    {
        return $this->hasMany(Property::class);
    }
}
