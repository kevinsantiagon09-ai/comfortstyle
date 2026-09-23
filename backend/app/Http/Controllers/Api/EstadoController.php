<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEstadoRequest;
use App\Http\Requests\UpdateEstadoRequest;
use App\Models\Estado;
use App\Services\EstadoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EstadoController extends Controller
{
    public function __construct(
        private readonly EstadoService $estadoService
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $estados = $request->boolean('solo_activos')
            ? $this->estadoService->getActive()
            : $this->estadoService->getAll();

        return response()->json([
            'message' => 'Estados obtenidos correctamente.',
            'data' => $estados,
        ]);
    }

    public function store(
        StoreEstadoRequest $request
    ): JsonResponse {
        $estado = $this->estadoService->create(
            $request->validated()
        );

        return response()->json([
            'message' => 'Estado creado correctamente.',
            'data' => $estado,
        ], 201);
    }

    public function show(Estado $estado): JsonResponse
    {
        return response()->json([
            'message' => 'Estado obtenido correctamente.',
            'data' => $estado,
        ]);
    }

    public function update(
        UpdateEstadoRequest $request,
        Estado $estado
    ): JsonResponse {
        $estado = $this->estadoService->update(
            $estado,
            $request->validated()
        );

        return response()->json([
            'message' => 'Estado actualizado correctamente.',
            'data' => $estado,
        ]);
    }
}