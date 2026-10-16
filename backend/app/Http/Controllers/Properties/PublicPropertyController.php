<?php

namespace App\Http\Controllers\Properties;

use App\Http\Controllers\Controller;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicPropertyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $properties = Property::query()
            ->where('is_active', true)
            ->with([
                'images' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('display_order');
                },
                'host:id,uuid,name',
                'location.department',
                'type',
            ])
            ->when(
                $request->filled('city'),
                fn ($query) => $query->whereHas('location', fn ($city) => $city->where('name', 'ilike', '%'.$request->string('city').'%'))
            )
            ->latest()
            ->paginate(12);

        return response()->json([
            'message' => 'Alojamientos consultados correctamente.',

            'data' => $properties,
        ]);
    }

    /** Alojamientos publicados que tienen ubicación, con lo justo para pintarlos en el mapa. */
    public function map(): JsonResponse
    {
        $properties = Property::query()
            ->where('is_active', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with([
                'images' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('display_order');
                },
                'location.department',
                'type',
            ])
            ->latest()
            ->limit(500)
            ->get();

        return response()->json([
            'data' => $properties->map(fn (Property $property) => [
                'uuid' => $property->uuid,
                'name' => $property->name,
                'property_type' => $property->property_type,
                'price' => $property->price,
                'currency' => $property->currency,
                'latitude' => $property->latitude,
                'longitude' => $property->longitude,
                'city' => $property->city,
                'department' => $property->department,
                'cover_path' => ($property->images->firstWhere('is_cover', true) ?? $property->images->first())?->image_path,
            ]),
        ]);
    }

    public function show(Property $property): JsonResponse
    {
        abort_unless($property->is_active, 404);

        return response()->json([
            'data' => $property->load([
                'host:id,uuid,name',
                'location.department',
                'type',
                'amenities:id,name,category,icon',
                'panoramas:id,property_id,title,image_path,preview_path,display_order',
                'images' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('display_order');
                },
            ]),
        ]);
    }
}
