<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {
    }

    public function register(
        RegisterRequest $request
    ): JsonResponse {
        $user = $this->authService->register(
            $request->validated()
        );

        return response()->json([
            'message' => 'Cuenta creada correctamente.',
            'data' => $user,
        ], 201);
    }

    public function login(
        LoginRequest $request
    ): JsonResponse {
        $user = $this->authService->login(
            $request->validated()
        );

        return response()->json([
            'message' => 'Sesión iniciada correctamente.',
            'data' => $user,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $request->user()->load('roles'),
        ]);
    }

    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json([
            'message' => 'Sesión cerrada correctamente.',
        ]);
    }
}