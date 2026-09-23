<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Models\Role;
use App\Services\RolesServices;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoleController extends Controller
{ 
    protected $roleService; 
    public function __construct(RolesServices $roleService)
    {
        $this->roleService = $roleService;
    }

    public function index(): JsonResponse
    {
        $roles = Role::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'message' => 'Roles consultados correctamente.',
            'data' => $roles,
        ]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = $this->roleService->create($request->validated());

        return response()->json([
            'message' => 'Rol creado correctamente.',
            'data' => $role,
        ], 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'message' => 'Rol consultado correctamente.',
            'data' => $role,
        ]);
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->name === 'SYSTEM ADMIN') {
            return response()->json([
                'message' => 'No se puede eliminar el rol de administrador del sistema.',
            ], 409);
        }

        $role->delete();

        return response()->json([
            'message' => 'Rol eliminado correctamente.',
        ]);
    }

}