<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\StoreUserRequest;
use App\Http\Requests\Auth\UpdateUserRequest;
use App\Models\User;
use App\Services\Auth\UsersService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UsersService $UsersService;

    public function __construct(UsersService $UsersService)
    {
        $this->UsersService = $UsersService;
    }

    public function index(Request $request): JsonResponse
      {
        $users = $this->UsersService->getAll(
            perPage: 20,
            search: $request->string('search')->toString()
        );

        return response()->json([
            'message' => 'Usuarios consultados correctamente.',
            'data' => $users,
        ]);
    }
   

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->UsersService->create(
            $request->validated());

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'data' => $user,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
