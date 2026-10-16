<?php

namespace App\Http\Controllers\Notifications;

use App\Http\Controllers\Controller;
use App\Services\Notifications\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Campana de notificaciones: sirve igual para huéspedes y anfitriones. */
class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->notificationService->feed($request->user()),
        ]);
    }

    public function read(Request $request, string $notification): JsonResponse
    {
        $this->notificationService->markRead($request->user(), $notification);

        return response()->json(['message' => 'Notificación marcada como leída.']);
    }

    public function readAll(Request $request): JsonResponse
    {
        $this->notificationService->markAllRead($request->user());

        return response()->json(['message' => 'Notificaciones marcadas como leídas.']);
    }
}
