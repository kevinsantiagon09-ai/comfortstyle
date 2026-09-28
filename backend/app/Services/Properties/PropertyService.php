<?php

namespace App\Services\Properties;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Throwable;

class PropertyService
{
    public function getAll(
        int $perPage = 20,
        string $search = '',
        bool $onlyActive = false,
        ?int $ownerId = null
    ): LengthAwarePaginator {
        return Property::query()->when($ownerId !== null, fn ($query) => $query->where('user_id', $ownerId))
            ->with([
                'location.department',
                'host:id,uuid,name,email',

                'images' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('display_order');
                },
            ])
            ->when($onlyActive, function ($query) {
                $query->where('is_active', true);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($subQuery) use ($search) {
                    $subQuery
                        ->where('name', 'ilike', "%{$search}%")
                        ->orWhere(
                            'property_type',
                            'ilike',
                            "%{$search}%"
                        )
                        ->orWhereHas('location', fn ($location) => $location->where('name', 'ilike', "%{$search}%"))
                        ->orWhereHas('location.department', fn ($department) => $department->where('name', 'ilike', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Registra el alojamiento junto con sus fotografías; la primera queda como portada.
     * Si algo falla, no queda ni el registro ni los archivos subidos.
     */
    public function create(array $data): Property
    {
        $images = $data['images'] ?? [];
        unset($data['images']);
        $data['is_active'] ??= true;
        $paths = [];

        try {
            return DB::transaction(function () use ($data, $images, &$paths): Property {
                $property = Property::create($data);

                foreach (array_values($images) as $order => $image) {
                    $paths[] = $path = $image->store("properties/{$property->id}", 'public');
                    $property->images()->create([
                        'image_path' => $path,
                        'is_cover' => $order === 0,
                        'display_order' => $order,
                        'is_active' => true,
                    ]);
                }

                return $property->load(
                    'host:id,uuid,name,email', 'location.department', 'images'
                );
            });
        } catch (Throwable $exception) {
            Storage::disk('public')->delete($paths);

            throw $exception;
        }
    }

    public function find(Property $property): Property
    {
        return $property->load(
            'host:id,uuid,name,email', 'location.department', 'images'
        );
    }

    public function update(
        Property $property,
        array $data
    ): Property {
        return DB::transaction(
            function () use ($property, $data): Property {
                $property->update($data);

                return $property
                    ->fresh()
                    ->load('host:id,uuid,name,email', 'location.department', 'images');
            }
        );
    }
}
