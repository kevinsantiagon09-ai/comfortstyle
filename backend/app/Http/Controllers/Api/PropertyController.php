<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Properties\StorePropertyRequest;
use App\Http\Requests\Properties\UpdatePropertyRequest;
use App\Models\Property;
use App\Services\Properties\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;


class PropertyController extends Controller
{
    protected PropertyService $propertyService;
    
     public function __construct(
        PropertyService $propertyService
    ) {
        $this->propertyService = $propertyService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
      $properties = $this->propertyService->getAll(
        perPage: 20,
        search: $request->string('search')
            ->trim()
            ->toString(),
        onlyActive: $request->boolean('only_active')
    );

    return response()->json([
        'message' => 'Propiedades consultadas correctamente.',
        'data' => $properties,
    ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store( StorePropertyRequest $request): JsonResponse
    {
        $property = $this->propertyService->create(
        $request->validated()
    );

    return response()->json([
        'message' => 'Propiedad creada correctamente.',
        'data' => $property,
    ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(  Property $property): JsonResponse
    {
         $property = $this->propertyService->find(
        $property
    );

    return response()->json([
        'message' => 'Propiedad consultada correctamente.',
        'data' => $property,
    ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update( UpdatePropertyRequest $request,
    Property $property): JsonResponse
    {
        $property = $this->propertyService->update(
        $property,
        $request->validated()
    );

    return response()->json([
        'message' => 'Propiedad actualizada correctamente.',
        'data' => $property,
    ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
