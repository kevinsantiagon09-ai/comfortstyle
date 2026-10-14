<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordRecoveryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['guest:web', 'throttle:auth-requests'])->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->block(30, 10);
    Route::post('/login', [AuthController::class, 'login'])->block(30, 10);
    Route::post('/mfa/verify', [AuthController::class, 'verifyMfa'])->block(30, 10);
    Route::post('/mfa/resend', [AuthController::class, 'resendMfa'])->block(30, 10);
    Route::post('/mfa/cancel', [AuthController::class, 'cancelMfa'])->block(30, 10);
});

Route::middleware(['guest:web', 'throttle:password-recovery'])->group(function () {
    Route::post('/forgot-password', [PasswordRecoveryController::class, 'sendResetLink'])
        ->name('password.email')
        ->block(30, 10);
    Route::post('/reset-password', [PasswordRecoveryController::class, 'resetPassword'])
        ->name('password.update')
        ->block(30, 10);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [
        AuthController::class,
        'me',
    ]);

    Route::post('/logout', [
        AuthController::class,
        'logout',
    ]);
});
