<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\MfaChallengeRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\VerifyMfaRequest;
use App\Services\Auth\AuthChallengeService;
use App\Services\Auth\AuthService;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
        protected AuthChallengeService $challenges
    ) {}

    public function register(
        RegisterRequest $request
    ): JsonResponse {
        $user = $this->authService->register(
            $request->validated()
        );

        try {
            $challenge = $this->challenges->start($user);
        } catch (HttpResponseException $exception) {
            $response = $exception->getResponse();

            if ($response instanceof JsonResponse && ($response->getData(true)['code'] ?? null) === 'mfa_delivery_failed') {
                return response()->json([
                    'message' => 'La cuenta fue creada, pero no pudimos enviar el código. Inicia sesión para volver a solicitarlo.',
                    'code' => 'mfa_delivery_failed',
                    'account_created' => true,
                ], 503);
            }

            throw $exception;
        }

        return response()->json([
            'message' => 'Cuenta creada. Ingresa el código enviado a tu correo para completar el registro.',
            'data' => $challenge,
        ], 201);
    }

    public function login(
        LoginRequest $request
    ): JsonResponse {
        $challenge = $this->challenges->start(
            $request->authenticatedUser()
        );

        return response()->json([
            'message' => 'Ingresa el código enviado a tu correo para iniciar sesión.',
            'data' => $challenge,
        ]);
    }

    public function verifyMfa(VerifyMfaRequest $request): JsonResponse
    {
        $user = $this->challenges->verify(
            (string) $request->validated('challenge_id'),
            (string) $request->validated('code')
        );

        return response()->json([
            'message' => 'Sesión iniciada correctamente.',
            'data' => $user,
        ]);
    }

    public function resendMfa(MfaChallengeRequest $request): JsonResponse
    {
        return response()->json([
            'message' => 'Enviamos un nuevo código de verificación a tu correo.',
            'data' => $this->challenges->resend((string) $request->validated('challenge_id')),
        ]);
    }

    public function cancelMfa(MfaChallengeRequest $request): JsonResponse
    {
        $this->challenges->cancel((string) $request->validated('challenge_id'));

        return response()->json([
            'message' => 'Verificación cancelada.',
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
