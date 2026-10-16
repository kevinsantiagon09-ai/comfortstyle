<?php

namespace App\Notifications\Reservations;

/** Para el anfitrión: el huésped canceló su reserva y las fechas quedan libres. */
class ReservationCancelled extends ReservationNotification
{
    protected function kind(): string
    {
        return 'reservation_cancelled';
    }

    protected function title(): string
    {
        return "{$this->reservation->guest->name} canceló su reserva en «{$this->reservation->property->name}»";
    }
}
