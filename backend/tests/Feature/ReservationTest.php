<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ReservationTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $name): User
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['name' => $name, 'is_active' => true]);
        $user->roles()->attach($role, ['uuid' => (string) Str::uuid()]);

        return $user;
    }

    private function payload(Property $property, int $from = 5, int $to = 7, int $guests = 2): array
    {
        return [
            'property_id' => $property->id,
            'check_in' => now()->addDays($from)->toDateString(),
            'check_out' => now()->addDays($to)->toDateString(),
            'guests' => $guests,
        ];
    }

    public function test_only_guests_can_reserve(): void
    {
        $property = Property::factory()->create();
        $this->postJson('/api/reservations', $this->payload($property))->assertUnauthorized();
        $this->actingAs($this->userWithRole('ANFITRION'))
            ->postJson('/api/reservations', $this->payload($property))->assertForbidden();
    }

    public function test_price_is_calculated_by_server(): void
    {
        $property = Property::factory()->create(['price' => 150000]);
        $this->actingAs($this->userWithRole('HUESPED'))
            ->postJson('/api/reservations', [...$this->payload($property), 'total_price' => 1])
            ->assertCreated()
            ->assertJsonPath('data.nights', 2)
            ->assertJsonPath('data.total_price', '300000.00');
    }

    public function test_rejects_overlapping_dates_and_too_many_guests(): void
    {
        $property = Property::factory()->create(['max_guests' => 2]);
        $this->actingAs($this->userWithRole('HUESPED'));
        $this->postJson('/api/reservations', $this->payload($property, 5, 8))->assertCreated();
        $this->postJson('/api/reservations', $this->payload($property, 7, 9))->assertJsonValidationErrors('check_in');
        $this->postJson('/api/reservations', $this->payload($property, 8, 10))->assertCreated(); // el día de salida queda libre
        $this->postJson('/api/reservations', $this->payload($property, 20, 22, 3))->assertJsonValidationErrors('guests');
    }

    public function test_rejects_inactive_property_and_past_dates(): void
    {
        $this->actingAs($this->userWithRole('HUESPED'));
        $inactive = Property::factory()->create(['is_active' => false]);
        $this->postJson('/api/reservations', $this->payload($inactive))->assertJsonValidationErrors('property_id');
        $this->postJson('/api/reservations', $this->payload(Property::factory()->create(), -2, 1))->assertJsonValidationErrors('check_in');
    }

    public function test_guest_lists_and_cancels_only_own_reservations(): void
    {
        $property = Property::factory()->create();
        $owner = $this->userWithRole('HUESPED');
        $id = $this->actingAs($owner)->postJson('/api/reservations', $this->payload($property))->json('data.id');

        $other = $this->userWithRole('HUESPED');
        $this->actingAs($other)->getJson('/api/reservations')->assertOk()->assertJsonCount(0, 'data.data');
        $this->patchJson("/api/reservations/{$id}/cancel")->assertForbidden();

        $this->actingAs($owner)->getJson('/api/reservations')->assertOk()->assertJsonCount(1, 'data.data');
        $this->patchJson("/api/reservations/{$id}/cancel")->assertOk()->assertJsonPath('data.status', 'CANCELADA');
        $this->patchJson("/api/reservations/{$id}/cancel")->assertJsonValidationErrors('status');
    }
}
