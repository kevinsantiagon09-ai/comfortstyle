<?php

namespace App\Services\Properties;

use App\Models\PropertyType;
use Illuminate\Database\Eloquent\Collection;

class PropertyTypeService
{
    public function getAll(): Collection
    {
        return PropertyType::query()
            ->withCount('properties')
            ->orderBy('name')
            ->get();
    }

    public function getActive(): Collection
    {
        return PropertyType::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'uuid', 'name', 'description', 'icon']);
    }

    public function create(array $data): PropertyType
    {
       return PropertyType::create($data)->fresh();

    }

    public function update(PropertyType $propertyType, array $data): PropertyType
    {
        $propertyType->update($data);

        return $propertyType->fresh();
    }
}
