<?php

namespace App\Services\Reservations;

use App\Models\Property;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReservationService
{
    private const RELATIONS = ['property.location.department', 'property.images'];

    public function listForGuest(int $userId, int $perPage = 10): LengthAwarePaginator
    {
        return Reservation::query()
            ->where('user_id', $userId)
            ->with(self::RELATIONS)
            ->latest('check_in')
            ->paginate($perPage);
    }

    /**
     * Crea la reserva calculando noches y total en el servidor.
     * Bloquea la fila del alojamiento para que dos reservas simultáneas no ocupen las mismas fechas.
     */
    public function create(User $guest, array $data): Reservation
    {
        return DB::transaction(function () use ($guest, $data): Reservation {
            $property = Property::whereKey($data['property_id'])->lockForUpdate()->firstOrFail();

            if (! $property->is_active) {
                throw ValidationException::withMessages(['property_id' => 'El alojamiento no está disponible.']);
            }
            if ($property->user_id === $guest->id) {
                throw ValidationException::withMessages(['property_id' => 'No puedes reservar tu propio alojamiento.']);
            }
            if ($data['guests'] > $property->max_guests) {
                throw ValidationException::withMessages(['guests' => "Este alojamiento admite máximo {$property->max_guests} huéspedes."]);
            }

            $taken = Reservation::where('property_id', $property->id)
                ->overlapping($data['check_in'], $data['check_out'])
                ->exists();
            if ($taken) {
                throw ValidationException::withMessages(['check_in' => 'El alojamiento ya está reservado en esas fechas.']);
            }

            $nights = (int) Carbon::parse($data['check_in'])->diffInDays($data['check_out']);

            return Reservation::create([
                'property_id' => $property->id,
                'user_id' => $guest->id,
                'check_in' => $data['check_in'],
                'check_out' => $data['check_out'],
                'guests' => $data['guests'],
                'nights' => $nights,
                'price_per_night' => $property->price,
                'total_price' => round((float) $property->price * $nights, 2),
                'currency' => $property->currency,
                'status' => Reservation::CONFIRMADA,
            ])->load(self::RELATIONS);
        });
    }

    public function cancel(Reservation $reservation): Reservation
    {
        if ($reservation->status === Reservation::CANCELADA) {
            throw ValidationException::withMessages(['status' => 'La reserva ya está cancelada.']);
        }
        if ($reservation->check_in->lte(today())) {
            throw ValidationException::withMessages(['status' => 'No puedes cancelar una reserva que ya empezó.']);
        }

        $reservation->update(['status' => Reservation::CANCELADA]);

        return $reservation->fresh()->load(self::RELATIONS);
    }
}
