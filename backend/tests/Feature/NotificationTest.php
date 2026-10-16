<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Reservation;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Str;
use RuntimeException;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $name): User
    {
        $user = User::factory()->create();
        $user->roles()->attach(
            Role::firstOrCreate(['name' => $name], ['is_active' => true]),
            ['uuid' => (string) Str::uuid()]
        );

        return $user;
    }

    /** @return array{0: User, 1: User, 2: string} anfitrión, huésped y uuid de la reserva */
    private function reserve(): array
    {
        $host = $this->userWithRole('ANFITRION');
        $guest = $this->userWithRole('HUESPED');
        $property = Property::factory()->for($host, 'host')->create(['name' => 'Choco aventura', 'price' => 150000]);

        $uuid = $this->actingAs($guest)->postJson('/api/reservations', [
            'property_id' => $property->id,
            'check_in' => now()->addDays(5)->toDateString(),
            'check_out' => now()->addDays(7)->toDateString(),
            'guests' => 2,
        ])->assertCreated()->json('data.uuid');

        return [$host, $guest, $uuid];
    }

    public function test_a_reservation_notifies_the_host_and_the_guest(): void
    {
        [$host, $guest] = $this->reserve();

        $this->actingAs($host)->getJson('/api/notifications')->assertOk()
            ->assertJsonPath('data.unread_count', 1)
            ->assertJsonPath('data.items.0.kind', 'reservation_received')
            ->assertJsonPath('data.items.0.title', "{$guest->name} reservó «Choco aventura»")
            ->assertJsonPath('data.items.0.actor_name', $guest->name)
            ->assertJsonPath('data.items.0.read_at', null);

        $this->actingAs($guest)->getJson('/api/notifications')->assertOk()
            ->assertJsonPath('data.unread_count', 1)
            ->assertJsonPath('data.items.0.kind', 'reservation_confirmed');
    }

    public function test_cancelling_notifies_the_host(): void
    {
        [$host, $guest, $uuid] = $this->reserve();
        $reservation = Reservation::where('uuid', $uuid)->firstOrFail();
        $this->travel(1)->minutes();

        $this->actingAs($guest)->patchJson("/api/reservations/{$reservation->id}/cancel")->assertOk();

        $this->actingAs($host)->getJson('/api/notifications')
            ->assertJsonPath('data.unread_count', 2)
            ->assertJsonPath('data.items.0.kind', 'reservation_cancelled');
    }

    public function test_notifications_are_marked_as_read_one_by_one_or_all_at_once(): void
    {
        [$host, $guest, $uuid] = $this->reserve();
        $this->travel(1)->minutes();
        $this->actingAs($guest)->patchJson('/api/reservations/'.Reservation::where('uuid', $uuid)->value('id').'/cancel');
        // notifications() ya viene de la más reciente a la más antigua.
        [$cancelled, $received] = $host->notifications()->get()->all();

        $this->actingAs($host)->patchJson("/api/notifications/{$received->id}/read")->assertOk();
        $this->getJson('/api/notifications')->assertJsonPath('data.unread_count', 1);
        $this->assertNull($cancelled->fresh()->read_at);

        $this->patchJson('/api/notifications/read-all')->assertOk();
        $this->getJson('/api/notifications')->assertJsonPath('data.unread_count', 0);
    }

    public function test_users_cannot_touch_other_users_notifications(): void
    {
        [$host] = $this->reserve();
        $notification = $host->notifications()->first();

        $this->actingAs($this->userWithRole('ANFITRION'))
            ->patchJson("/api/notifications/{$notification->id}/read")->assertNotFound();
        $this->assertNull($notification->fresh()->read_at);

        $this->app['auth']->forgetGuards();
        $this->getJson('/api/notifications')->assertUnauthorized();
    }

    public function test_a_broadcast_failure_does_not_undo_the_reservation(): void
    {
        Broadcast::shouldReceive('connection')->andThrow(new RuntimeException('Reverb apagado'));

        [$host] = $this->reserve();

        $this->assertDatabaseCount('reservations', 1);
        $this->assertSame(1, $host->notifications()->count());
    }
}
