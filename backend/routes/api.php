<?php
use App\Http\Controllers\Auth\UserController;
use App\Http\Controllers\Api\EstadoController;
use App\Http\Controllers\Api\RoleController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('roles',RoleController::class)->except(['destroy']);
Route::apiResource('estados',EstadoController::class)->except(['destroy']);
Route::apiResource('users',UserController::class)->except(['destroy']);

