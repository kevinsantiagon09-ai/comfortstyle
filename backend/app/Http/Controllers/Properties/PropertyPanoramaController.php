<?php

namespace App\Http\Controllers\Properties;

use App\Http\Controllers\Controller;
use App\Http\Requests\Properties\StorePropertyPanoramaRequest;
use App\Models\Property;
use App\Models\PropertyPanorama;
use App\Services\Properties\PropertyPanoramaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PropertyPanoramaController extends Controller
{
    public function __construct(
        protected PropertyPanoramaService $panoramaService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => ['required', 'integer', 'exists:properties,id'],
        ]);

        $property = Property::findOrFail($validated['property_id']);
        Gate::authorize('view', $property);

        return response()->json([
            'message' => 'Recorrido consultado correctamente.',
            'data' => $this->panoramaService->getByProperty($property),
        ]);
    }

    public function store(StorePropertyPanoramaRequest $request): JsonResponse
    {
        Gate::authorize('update', Property::findOrFail($request->validated('property_id')));

        return response()->json([
            'message' => 'Espacio agregado al recorrido.',
            'data' => $this->panoramaService->create($request->validated()),
        ], 201);
    }

    public function destroy(PropertyPanorama $propertyPanorama): JsonResponse
    {
        Gate::authorize('update', $propertyPanorama->property);
        $this->panoramaService->delete($propertyPanorama);

        return response()->json([
            'message' => 'Espacio eliminado del recorrido.',
        ]);
    }
}
