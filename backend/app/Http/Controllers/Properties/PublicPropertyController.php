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

    public function show(Property $property): JsonResponse
    {
        abort_unless($property->is_active, 404);

        return response()->json([
            'data' => $property->load([
                'host:id,uuid,name',
                'location.department',
                'amenities:id,name,category,icon',
                'images' => function ($query) {
                    $query
                        ->where('is_active', true)
                        ->orderBy('display_order');
                },
            ]),
        ]);
    }
}
