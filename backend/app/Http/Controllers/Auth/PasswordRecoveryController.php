<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Auth\PasswordRecoveryService;
use Illuminate\Http\JsonResponse;

class PasswordRecoveryController extends Controller
{
    public function __construct(protected PasswordRecoveryService $recovery) {}

    public function sendResetLink(ForgotPasswordRequest $request): JsonResponse
    {
        $this->recovery->sendResetLink((string) $request->validated('email'));

        return response()->json([
            'message' => 'Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.',
            'resend_after' => (int) config('auth.passwords.'.config('auth.defaults.passwords').'.throttle', 60),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->recovery->resetPassword($request->validated());

        return response()->json([
            'message' => 'Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.',
        ]);
    }
}
