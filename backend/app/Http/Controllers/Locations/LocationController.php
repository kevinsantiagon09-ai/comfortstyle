<?php

namespace App\Http\Controllers\Locations;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    public function departments(): JsonResponse
    {
        return response()->json(['data' => Department::orderBy('name')->get(['id', 'name', 'code'])]);
    }

    public function cities(Department $department): JsonResponse
    {
        return response()->json(['data' => $department->cities()->orderBy('name')->get(['id', 'department_id', 'name', 'code'])]);
    }
}
