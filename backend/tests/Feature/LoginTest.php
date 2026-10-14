<?php

namespace Tests\Feature;

use App\Mail\AuthVerificationCode;
use App\Models\Estado;
use App\Models\User;
use Database\Seeders\EstadoSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->seed([RoleSeeder::class, EstadoSeeder::class]);
    }

    private function user(string $estado = Estado::ACTIVO): User
    {
        return User::factory()->create([
            'email' => 'ana@example.org',
            'password' => 'Password123',
            'status_id' => Estado::where('descripcion', $estado)->value('id'),
        ]);
    }

    private function login(array $data)
    {
        return $this->withCredentials()->withCookie(config('session.cookie'), session()->getId())
            ->postJson('/login', $data);
    }

    public function test_active_user_logs_in_after_verifying_email_code(): void
    {
        $user = $this->user();

        $response = $this->login(['email' => ' ana@example.org ', 'password' => 'Password123'])
            ->assertOk()->assertJsonPath('data.status', 'mfa_required');
        $this->assertGuest();
        Mail::assertSent(AuthVerificationCode::class, fn (AuthVerificationCode $mail): bool => $mail->hasTo($user->email));

        $this->withCredentials()->withCookie(config('session.cookie'), session()->getId())
            ->postJson('/mfa/verify', [
                'challenge_id' => $response->json('data.challenge_id'),
                'code' => Mail::sent(AuthVerificationCode::class)->last()->code,
            ])->assertOk()->assertJsonPath('data.id', $user->id);
        $this->assertAuthenticatedAs($user);
    }

    public function test_reports_each_field_error(): void
    {
        $this->login([])->assertUnprocessable()->assertJsonValidationErrors([
            'email' => 'El correo electrónico es obligatorio.',
            'password' => 'La contraseña es obligatoria.',
        ]);
        $this->login(['email' => 'no-es-correo', 'password' => 'x'])->assertJsonValidationErrors(['email' => 'El correo electrónico no es válido.']);
    }

    public function test_unknown_email_is_reported_on_email(): void
    {
        $this->login(['email' => 'nadie@example.org', 'password' => 'Password123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'No existe una cuenta con este correo.'])
            ->assertJsonMissingValidationErrors('password');
    }

    public function test_wrong_password_is_reported_on_password(): void
    {
        $this->user();

        $this->login(['email' => 'ana@example.org', 'password' => 'Otra12345'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['password' => 'La contraseña es incorrecta.'])
            ->assertJsonMissingValidationErrors('email');
        $this->assertGuest();
    }

    public function test_inactive_user_cannot_log_in(): void
    {
        $this->user('INACTIVO');

        $this->login(['email' => 'ana@example.org', 'password' => 'Password123'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email' => 'Tu cuenta está inactiva. Comunícate con el administrador.']);
        $this->assertGuest();
    }

    public function test_user_without_status_is_inactive(): void
    {
        User::factory()->create(['email' => 'ana@example.org', 'password' => 'Password123', 'status_id' => null]);

        $this->login(['email' => 'ana@example.org', 'password' => 'Password123'])->assertJsonValidationErrors('email');
        $this->assertGuest();
    }

    public function test_inactive_status_is_hidden_without_the_right_password(): void
    {
        $this->user('INACTIVO');

        $this->login(['email' => 'ana@example.org', 'password' => 'Otra12345'])
            ->assertJsonValidationErrors(['password' => 'La contraseña es incorrecta.'])
            ->assertJsonMissingValidationErrors('email');
    }

    public function test_soft_deleted_user_does_not_exist_for_login(): void
    {
        $this->user()->forceFill(['deleted_at' => now()])->save();

        $this->login(['email' => 'ana@example.org', 'password' => 'Password123'])->assertJsonValidationErrors(['email' => 'No existe una cuenta con este correo.']);
    }

    public function test_registration_creates_an_active_account(): void
    {
        $this->postJson('/register', ['name' => 'Ana', 'email' => 'ana@example.org', 'password' => 'Password123', 'password_confirmation' => 'Password123', 'role' => 'HUESPED'])->assertCreated();

        $this->assertTrue(User::where('email', 'ana@example.org')->firstOrFail()->isActive());
    }

    public function test_login_is_blocked_on_the_tenth_failed_attempt(): void
    {
        $this->user();
        foreach (range(1, 9) as $attempt) {
            $this->login(['email' => 'ana@example.org', 'password' => 'Otra12345'])->assertUnprocessable();
        }

        $this->login(['email' => 'ana@example.org', 'password' => 'Otra12345'])
            ->assertTooManyRequests()->assertJsonPath('code', 'auth_locked')->assertHeader('Retry-After', '86400');
        $this->login(['email' => 'ana@example.org', 'password' => 'Password123'])->assertTooManyRequests();
        $this->assertGuest();
    }
}
