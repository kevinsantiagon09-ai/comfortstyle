<?php

use App\Http\Controllers\Locations\LocationController;
use App\Http\Controllers\Properties\PropertyController;
use App\Http\Controllers\Properties\PropertyImageController;
use App\Http\Controllers\Properties\PublicPropertyController;
use App\Http\Controllers\Roles\RoleController;
use App\Http\Controllers\States\EstadoController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'role:SYSTEM_ADMIN'])->group(function () {
    Route::apiResource('roles', RoleController::class)->except(['destroy']);
    Route::apiResource('estados', EstadoController::class)->except(['destroy']);
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'update']);
});
Route::middleware(['auth:sanctum', 'role:ANFITRION'])->group(function () {
    // Precognition permite validar cada paso del asistente con estas mismas reglas antes del registro final.
    Route::apiResource('property', PropertyController::class)->except(['destroy'])->middleware(HandlePrecognitiveRequests::class);
    Route::apiResource('property-images', PropertyImageController::class)->except(['destroy']);
});
Route::get('/public/departments', [LocationController::class, 'departments']);
Route::get('/public/departments/{department}/cities', [LocationController::class, 'cities']);

Route::get('/public/properties', [PublicPropertyController::class, 'index']);
Route::get('/public/properties/{property}', [PublicPropertyController::class, 'show']);
