<?php

namespace App\Http\Controllers\Properties;

use App\Http\Controllers\Controller;
use App\Http\Requests\Properties\StorePropertyImageRequest;
use App\Http\Requests\Properties\UpdatePropertyImageRequest;
use App\Models\Property;
use App\Models\PropertyImage;
use App\Services\Properties\PropertyImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PropertyImageController extends Controller
{
    protected PropertyImageService $propertyImageService;

    public function __construct(
        PropertyImageService $propertyImageService
    ) {
        $this->propertyImageService = $propertyImageService;
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'property_id' => [
                'required',
                'integer',
                'exists:properties,id',
            ],

            'only_active' => [
                'sometimes',
                'boolean',
            ],
        ]);

        $property = Property::findOrFail(
            $validated['property_id']
        );

        Gate::authorize('view', $property);
        $images = $this->propertyImageService
            ->getByProperty(
                property: $property,
                onlyActive: $request->boolean('only_active')
            );

        return response()->json([
            'message' => 'Imágenes consultadas correctamente.',

            'data' => $images,
        ]);
    }

    public function store(
        StorePropertyImageRequest $request
    ): JsonResponse {
        Gate::authorize('update', Property::findOrFail($request->validated('property_id')));
        $propertyImage = $this->propertyImageService
            ->create($request->validated());

        return response()->json([
            'message' => 'Imagen registrada correctamente.',

            'data' => $propertyImage,
        ], 201);
    }

    public function show(
        PropertyImage $propertyImage
    ): JsonResponse {
        Gate::authorize('update', $propertyImage->property);
        $propertyImage = $this->propertyImageService
            ->find($propertyImage);

        return response()->json([
            'message' => 'Imagen consultada correctamente.',

            'data' => $propertyImage,
        ]);
    }

    public function update(
        UpdatePropertyImageRequest $request,
        PropertyImage $propertyImage
    ): JsonResponse {
        Gate::authorize('update', $propertyImage->property);
        $propertyImage = $this->propertyImageService
            ->update(
                $propertyImage,
                $request->validated()
            );

        return response()->json([
            'message' => 'Imagen actualizada correctamente.',

            'data' => $propertyImage,
        ]);
    }
}
