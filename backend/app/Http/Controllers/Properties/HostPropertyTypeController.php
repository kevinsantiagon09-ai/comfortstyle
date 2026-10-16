<?php

namespace App\Http\Controllers\Properties;

use App\Http\Controllers\Controller;
use App\Http\Requests\Properties\StoreHostPropertyTypeRequest;
use App\Http\Requests\Properties\UpdateHostPropertyTypeRequest;
use App\Models\PropertyType;
use App\Services\Properties\PropertyTypeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Tipos de alojamiento desde el formulario del anfitrión: usa los globales y administra los suyos. */
class HostPropertyTypeController extends Controller
{
    public function __construct(
        private readonly PropertyTypeService $propertyTypeService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->propertyTypeService->getForHost($request->user()->id),
        ]);
    }

    public function store(StoreHostPropertyTypeRequest $request): JsonResponse
    {
        $propertyType = $this->propertyTypeService->createForHost(
            $request->user()->id,
            $request->validated()
        );

        return response()->json([
            'message' => 'Tipo de alojamiento creado correctamente.',
            'data' => $propertyType,
        ], 201);
    }

    public function update(
        UpdateHostPropertyTypeRequest $request,
        PropertyType $propertyType
    ): JsonResponse {
        return response()->json([
            'message' => 'Tipo de alojamiento actualizado correctamente.',
            'data' => $this->propertyTypeService->update($propertyType, $request->validated()),
        ]);
    }
}
