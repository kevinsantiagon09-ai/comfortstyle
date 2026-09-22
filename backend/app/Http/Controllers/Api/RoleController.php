<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\JsonResponse;

class RoleController extends Controller
{
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

    public function show(Role $role): JsonResponse
    {
        return response()->json([
            'message' => 'Rol consultado correctamente.',
            'data' => $role,
        ]);
    }
}