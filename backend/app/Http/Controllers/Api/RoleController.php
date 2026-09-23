<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
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

    public function index(Request $request): JsonResponse
    {
        $roles = $request->boolean('solo_activos')
            ? $this->roleService->getActive()
            : $this->roleService->getAll();

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

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        return response()->json([
            'message' => 'Rol actualizado correctamente.',
            'data' => $this->roleService->update($role, $request->validated()),
        ]);
    }
}