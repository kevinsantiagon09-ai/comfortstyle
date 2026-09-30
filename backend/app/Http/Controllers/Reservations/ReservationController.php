<?php

namespace App\Http\Controllers\Reservations;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservations\StoreReservationRequest;
use App\Models\Reservation;
use App\Services\Reservations\ReservationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ReservationController extends Controller
{
    public function __construct(
        protected ReservationService $reservationService
    ) {
    }

    /**
     * Reservas del huésped conectado, paginadas.
     */
    public function index(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Reservas consultadas correctamente.',
            'data' => $this->reservationService->listForGuest($request->user()->id),
        ]);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $reservation = $this->reservationService->create(
            $request->user(),
            $request->validated()
        );

        return response()->json([
            'message' => 'Reserva creada correctamente.',
            'data' => $reservation,
        ], 201);
    }

    public function cancel(Reservation $reservation): JsonResponse
    {
        Gate::authorize('cancel', $reservation);

        return response()->json([
            'message' => 'Reserva cancelada correctamente.',
            'data' => $this->reservationService->cancel($reservation),
        ]);
    }
}
