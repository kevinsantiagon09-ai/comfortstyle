<?php

namespace App\Notifications\Reservations;

use App\Models\Reservation;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

/**
 * Aviso sobre una reserva: se guarda en la base de datos (campana) y se emite por Reverb al instante.
 * Cada tipo define su título y su texto; el resto de los datos es común.
 */
abstract class ReservationNotification extends Notification
{
    public function __construct(protected Reservation $reservation) {}

    /** Identificador que el frontend usa para elegir ícono y color. */
    abstract protected function kind(): string;

    abstract protected function title(): string;

    /** @return list<string> */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /** @return array<string, mixed> */
    public function toArray(object $notifiable): array
    {
        $property = $this->reservation->property;
        $cover = $property->images->firstWhere('is_cover', true) ?? $property->images->first();

        return [
            'kind' => $this->kind(),
            'title' => $this->title(),
            'body' => $this->summary(),
            'reservation_uuid' => $this->reservation->uuid,
            'property_uuid' => $property->uuid,
            'property_name' => $property->name,
            'cover_path' => $cover?->image_path,
            'actor_name' => $this->reservation->guest->name,
        ];
    }

    /** Se emite sin pasar por la cola: así llega aunque no haya un worker corriendo. */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return (new BroadcastMessage($this->toArray($notifiable)))->onConnection('sync');
    }

    /** "9 – 16 jun · 2 huéspedes · $300.000 COP" */
    protected function summary(): string
    {
        $checkIn = $this->reservation->check_in->locale('es');
        $checkOut = $this->reservation->check_out->locale('es');
        $guests = $this->reservation->guests;
        $total = number_format((float) $this->reservation->total_price, 0, ',', '.');

        return sprintf(
            '%s – %s · %d %s · $%s %s',
            $checkIn->translatedFormat('j M'),
            $checkOut->translatedFormat('j M'),
            $guests,
            $guests === 1 ? 'huésped' : 'huéspedes',
            $total,
            $this->reservation->currency,
        );
    }
}
