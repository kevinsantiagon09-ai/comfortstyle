<?php

use App\Http\Controllers\Api\EstadoController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Users\UserRolesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('roles',RoleController::class)->except(['destroy']);
Route::apiResource('estados',EstadoController::class)->except(['destroy']);
Route::apiResource('user-roles',UserRolesController::class)->except(['destroy']);