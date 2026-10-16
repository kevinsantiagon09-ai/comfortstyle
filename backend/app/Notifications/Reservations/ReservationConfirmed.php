<?php

namespace App\Notifications\Reservations;

/** Para el huésped: su reserva quedó confirmada. */
class ReservationConfirmed extends ReservationNotification
{
    protected function kind(): string
    {
        return 'reservation_confirmed';
    }

    protected function title(): string
    {
        return "Tu reserva en «{$this->reservation->property->name}» está confirmada";
    }
}
