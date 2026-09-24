<?php

namespace App\Services\Properties;

use App\Models\Property;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class PropertyService
{
    public function getAll(
        int $perPage = 20,
        string $search = '',
        bool $onlyActive = false
    ): LengthAwarePaginator {
        return Property::query()
            ->with('host:id,uuid,name,email')
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
                        ->orWhere(
                            'department',
                            'ilike',
                            "%{$search}%"
                        )
                        ->orWhere(
                            'city',
                            'ilike',
                            "%{$search}%"
                        );
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): Property
    {
        return DB::transaction(function () use ($data): Property {
            $property = Property::create($data);

            return $property->load(
                'host:id,uuid,name,email'
            );
        });
    }

    public function find(Property $property): Property
    {
        return $property->load(
            'host:id,uuid,name,email'
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
                    ->load('host:id,uuid,name,email');
            }
        );
    }
}