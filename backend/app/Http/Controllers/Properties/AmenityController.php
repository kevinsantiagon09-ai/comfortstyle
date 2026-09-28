<?php

namespace App\Http\Controllers\Properties;

use App\Http\Controllers\Controller;
use App\Models\Amenity;
use Illuminate\Http\JsonResponse;

class AmenityController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => Amenity::where('is_active', true)
                ->orderBy('category')
                ->orderBy('name')
                ->get(['id', 'name', 'category', 'description', 'icon']),
        ]);
    }
}
