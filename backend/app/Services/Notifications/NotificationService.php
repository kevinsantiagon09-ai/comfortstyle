<?php

namespace App\Services\Notifications;

use App\Models\User;
use Illuminate\Notifications\DatabaseNotification;

class NotificationService
{
    private const LIMIT = 30;

    /** Las más recientes y cuántas faltan por leer, en el formato que pinta la campana. */
    public function feed(User $user): array
    {
        return [
            'items' => $user->notifications()->limit(self::LIMIT)->get()->map($this->present(...))->all(),
            'unread_count' => $user->unreadNotifications()->count(),
        ];
    }

    public function markRead(User $user, string $id): void
    {
        $user->notifications()->whereKey($id)->firstOrFail()->markAsRead();
    }

    public function markAllRead(User $user): void
    {
        $user->unreadNotifications()->update(['read_at' => now()]);
    }

    private function present(DatabaseNotification $notification): array
    {
        return [
            ...$notification->data,
            'id' => $notification->id,
            'read_at' => $notification->read_at,
            'created_at' => $notification->created_at,
        ];
    }
}
