<?php

namespace App\Services\Properties;

use App\Models\PropertyType;
use Illuminate\Database\Eloquent\Collection;

class PropertyTypeService
{
    /** Todos los tipos, globales y privados, para el panel del administrador. */
    public function getAll(): Collection
    {
        return PropertyType::query()
            ->with('owner:id,name')
            ->withCount('properties')
            ->orderBy('name')
            ->get();
    }

    /** Tipos globales activos, para el catálogo público. */
    public function getActive(): Collection
    {
        return PropertyType::where('is_active', true)
            ->whereNull('user_id')
            ->orderBy('name')
            ->get(['id', 'uuid', 'name', 'description', 'icon']);
    }

    /** Lo que el anfitrión puede elegir: los globales activos y los suyos. */
    public function getForHost(int $userId): Collection
    {
        return PropertyType::where('is_active', true)
            ->visibleTo($userId)
            ->orderBy('name')
            ->get(['id', 'uuid', 'name', 'description', 'icon', 'user_id']);
    }

    public function create(array $data): PropertyType
    {
        return PropertyType::create($data)->fresh();
    }

    /** El tipo queda privado del anfitrión que lo crea. */
    public function createForHost(int $userId, array $data): PropertyType
    {
        $propertyType = new PropertyType($data);
        $propertyType->user_id = $userId;
        $propertyType->save();

        return $propertyType->fresh();
    }

    public function update(PropertyType $propertyType, array $data): PropertyType
    {
        $propertyType->update($data);

        return $propertyType->fresh();
    }
}
