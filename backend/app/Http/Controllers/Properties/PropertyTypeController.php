<?php

namespace App\Http\Controllers\Properties;

use App\Http\Controllers\Controller;
use App\Http\Requests\Properties\StorePropertyTypeRequest;
use App\Http\Requests\Properties\UpdatePropertyTypeRequest;
use App\Models\PropertyType;
use App\Services\Properties\PropertyTypeService;
use Illuminate\Http\JsonResponse;

class PropertyTypeController extends Controller
{
    public function __construct(
        private readonly PropertyTypeService $propertyTypeService
    ) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'message' => 'Tipos de propiedad obtenidos correctamente.',
            'data' => $this->propertyTypeService->getAll(),
        ]);
    }

    /** Solo los activos, para el selector del formulario de propiedades. */
    public function active(): JsonResponse
    {
        return response()->json([
            'data' => $this->propertyTypeService->getActive(),
        ]);
    }

    public function store(StorePropertyTypeRequest $request): JsonResponse
    {
        $propertyType = $this->propertyTypeService->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Tipo de propiedad creado correctamente.',
            'data' => $propertyType,
        ], 201);
    }

    public function show(PropertyType $propertyType): JsonResponse
    {
        return response()->json([
            'message' => 'Tipo de propiedad obtenido correctamente.',
            'data' => $propertyType,
        ]);
    }

    public function update(
        UpdatePropertyTypeRequest $request,
        PropertyType $propertyType
    ): JsonResponse {
        $propertyType = $this->propertyTypeService->update(
            $propertyType,
            $request->validated()
        );

        return response()->json([
            'message' => 'Tipo de propiedad actualizado correctamente.',
            'data' => $propertyType,
        ]);
    }
}
