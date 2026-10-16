<?php

namespace App\Notifications\Reservations;

/** Para el anfitrión: un huésped reservó uno de sus alojamientos. */
class ReservationReceived extends ReservationNotification
{
    protected function kind(): string
    {
        return 'reservation_received';
    }

    protected function title(): string
    {
        return "{$this->reservation->guest->name} reservó «{$this->reservation->property->name}»";
    }
}
