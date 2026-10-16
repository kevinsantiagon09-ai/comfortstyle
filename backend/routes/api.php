<?php

use App\Http\Controllers\Locations\LocationController;
use App\Http\Controllers\Notifications\NotificationController;
use App\Http\Controllers\Properties\AmenityController;
use App\Http\Controllers\Properties\HostPropertyTypeController;
use App\Http\Controllers\Properties\PropertyController;
use App\Http\Controllers\Properties\PropertyImageController;
use App\Http\Controllers\Properties\PropertyPanoramaController;
use App\Http\Controllers\Properties\PropertyTypeController;
use App\Http\Controllers\Properties\PublicPropertyController;
use App\Http\Controllers\Reservations\ReservationController;
use App\Http\Controllers\Roles\RoleController;
use App\Http\Controllers\States\EstadoController;
use App\Http\Controllers\Users\UserController;
use Illuminate\Foundation\Http\Middleware\HandlePrecognitiveRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/read-all', [NotificationController::class, 'readAll']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])->whereUuid('notification');
});
Route::middleware(['auth:sanctum', 'role:SYSTEM_ADMIN'])->group(function () {
    Route::apiResource('roles', RoleController::class)->except(['destroy']);
    Route::apiResource('estados', EstadoController::class)->except(['destroy']);
    Route::apiResource('users', UserController::class)->only(['index', 'store', 'update']);
    Route::apiResource('property-types', PropertyTypeController::class)
        ->except(['destroy'])
        ->scoped(['property_type' => 'uuid']);
});
Route::middleware(['auth:sanctum', 'role:ANFITRION'])->group(function () {
    // Precognition permite validar cada paso del asistente con estas mismas reglas antes del registro final.
    Route::apiResource('property', PropertyController::class)->except(['destroy'])->scoped(['property' => 'uuid'])->middleware(HandlePrecognitiveRequests::class);
    Route::apiResource('property-images', PropertyImageController::class)->except(['destroy']);
    Route::apiResource('property-panoramas', PropertyPanoramaController::class)->only(['index', 'store', 'destroy']);
    Route::get('host/property-types', [HostPropertyTypeController::class, 'index']);
    Route::post('host/property-types', [HostPropertyTypeController::class, 'store']);
    Route::patch('host/property-types/{propertyType:uuid}', [HostPropertyTypeController::class, 'update']);
});
Route::middleware(['auth:sanctum', 'role:HUESPED'])->group(function () {
    Route::get('reservations', [ReservationController::class, 'index']);
    Route::post('reservations', [ReservationController::class, 'store']);
    Route::patch('reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
});
Route::get('/public/amenities', [AmenityController::class, 'index']);
Route::get('/public/property-types', [PropertyTypeController::class, 'active']);
Route::get('/public/departments', [LocationController::class, 'departments']);
Route::get('/public/departments/{department}/cities', [LocationController::class, 'cities']);

Route::get('/public/properties', [PublicPropertyController::class, 'index']);
// Antes de {property:uuid} para que «map» no se tome como un uuid.
Route::get('/public/properties/map', [PublicPropertyController::class, 'map']);
Route::get('/public/properties/{property:uuid}', [PublicPropertyController::class, 'show']);
