<?php

namespace App\Services\Reservations;

use App\Models\Reservation;
use App\Notifications\Reservations\ReservationCancelled;
use App\Notifications\Reservations\ReservationConfirmed;
use App\Notifications\Reservations\ReservationReceived;
use Illuminate\Notifications\Notification;
use Throwable;

/** Avisa al anfitrión y al huésped de los cambios en una reserva. */
class ReservationNotifier
{
    public function created(Reservation $reservation): void
    {
        $reservation->loadMissing('guest', 'property.host', 'property.images');
        $this->send($reservation->property->host, new ReservationReceived($reservation));
        $this->send($reservation->guest, new ReservationConfirmed($reservation));
    }

    public function cancelled(Reservation $reservation): void
    {
        $reservation->loadMissing('guest', 'property.host', 'property.images');
        $this->send($reservation->property->host, new ReservationCancelled($reservation));
    }

    /**
     * Un aviso que falla (por ejemplo, Reverb apagado) no debe deshacer la reserva:
     * se registra en el log y la operación sigue.
     */
    private function send(?object $user, Notification $notification): void
    {
        try {
            $user?->notify($notification);
        } catch (Throwable $exception) {
            report($exception);
        }
    }
}
