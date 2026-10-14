<?php

namespace Tests\Feature;

use App\Mail\AuthVerificationCode;
use App\Models\Estado;
use App\Models\Role;
use App\Models\User;
use App\Services\Auth\AuthAttemptService;
use Closure;
use Database\Seeders\EstadoSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class MfaAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, EstadoSeeder::class]);
        Mail::fake();
        $this->freezeTime();
    }

    public function test_registration_requires_email_code_before_creating_an_authenticated_session(): void
    {
        $response = $this->authPost('/register', [
            'name' => 'Ana',
            'email' => 'ana@example.org',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'HUESPED',
        ])->assertCreated();

        $this->assertChallengeResponse($response);
        $this->assertGuest();
        $user = User::where('email', 'ana@example.org')->firstOrFail();
        $this->assertNull($user->email_verified_at);
        $this->getJson('/me')->assertUnauthorized();
        $this->getJson('/api/user')->assertUnauthorized();
        Mail::assertSent(AuthVerificationCode::class, fn (AuthVerificationCode $mail): bool => $mail->hasTo($user->email));

        $this->verify($response->json('data.challenge_id'), $this->latestCode())
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->email_verified_at);
        $this->getJson('/me')->assertOk()->assertJsonPath('data.id', $user->id);
    }

    #[DataProvider('accountRoles')]
    public function test_existing_verified_users_of_every_role_must_complete_mfa(string $role): void
    {
        $user = $this->user($role);
        $this->assertNotNull($user->email_verified_at);

        $response = $this->beginLogin($user);

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
        $this->getJson('/api/user')->assertUnauthorized();
        $this->getJson('/api/users')->assertUnauthorized();

        $this->verify($response->json('data.challenge_id'), $this->latestCode())
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->assertAuthenticatedAs($user);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function accountRoles(): array
    {
        return [
            'guest' => ['HUESPED'],
            'host' => ['ANFITRION'],
            'administrator' => ['SYSTEM_ADMIN'],
        ];
    }

    public function test_wrong_email_code_does_not_authenticate(): void
    {
        $response = $this->beginLogin($this->user());

        $this->verify($response->json('data.challenge_id'), $this->wrongCode())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
        Mail::assertSentCount(1);
    }

    public function test_malformed_email_codes_are_rejected(): void
    {
        $response = $this->beginLogin($this->user());

        foreach (['12345', '1234567', 'abcdef'] as $code) {
            $this->verify($response->json('data.challenge_id'), $code)
                ->assertUnprocessable()
                ->assertJsonValidationErrors('code');
        }

        $this->assertGuest();
    }

    public function test_email_code_expires_after_ten_minutes(): void
    {
        $response = $this->beginLogin($this->user());
        $code = $this->latestCode();

        $this->travel(10)->minutes();

        $this->verify($response->json('data.challenge_id'), $code)
            ->assertUnprocessable()
            ->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    public function test_email_code_cannot_be_reused_after_successful_verification(): void
    {
        $user = $this->user();
        $response = $this->beginLogin($user);
        $challengeId = $response->json('data.challenge_id');
        $code = $this->latestCode();
        $this->verify($challengeId, $code)->assertOk();
        $this->authPost('/logout', [])->assertOk();

        $this->verify($challengeId, $code)
            ->assertUnprocessable()
            ->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
    }

    public function test_code_cannot_be_verified_if_it_expires_while_waiting_for_account_lock(): void
    {
        $response = $this->beginLogin($this->user());
        $code = $this->latestCode();
        $this->travel(599)->seconds();

        $this->partialMock(AuthAttemptService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('withAccountLock')->once()
                ->andReturnUsing(function (string $email, Closure $callback): mixed {
                    $this->travel(2)->seconds();

                    return $callback($email);
                });
        });

        $this->verify($response->json('data.challenge_id'), $code)
            ->assertUnprocessable()->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
    }

    public function test_code_expiring_during_database_verification_does_not_verify_email_or_authenticate(): void
    {
        $user = $this->user();
        $user->forceFill(['email_verified_at' => null])->save();
        $response = $this->beginLogin($user);
        $code = $this->latestCode();
        $this->travel(599)->seconds();
        $delayed = false;

        DB::listen(function (QueryExecuted $query) use (&$delayed): void {
            if (! $delayed && request()->is('mfa/verify') && str_contains($query->sql, '"users"')) {
                $delayed = true;
                $this->travel(2)->seconds();
            }
        });

        $this->verify($response->json('data.challenge_id'), $code)
            ->assertUnprocessable()->assertJsonPath('code', 'mfa_expired');

        $this->assertTrue($delayed);
        $this->assertNull($user->fresh()->email_verified_at);
        $this->assertGuest();
    }

    public function test_challenge_cannot_be_used_in_another_browser_session(): void
    {
        $response = $this->beginLogin($this->user());
        $code = $this->latestCode();
        $this->beginNewSession();

        $this->verify($response->json('data.challenge_id'), $code)
            ->assertUnprocessable()
            ->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
    }

    public function test_resending_has_a_cooldown_and_invalidates_the_previous_code(): void
    {
        $user = $this->user();
        $response = $this->beginLogin($user);
        $challengeId = $response->json('data.challenge_id');
        $previousCode = $this->latestCode();

        $this->authPost('/mfa/resend', ['challenge_id' => $challengeId])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'mfa_resend_throttled')
            ->assertHeader('Retry-After', '60');
        Mail::assertSentCount(1);

        $this->travel(60)->seconds();
        $resent = $this->authPost('/mfa/resend', ['challenge_id' => $challengeId])->assertOk();
        $this->assertChallengeResponse($resent);
        $newChallengeId = $resent->json('data.challenge_id');
        $this->assertNotSame($challengeId, $newChallengeId);
        Mail::assertSentCount(2);
        $newCode = $this->latestCode();

        $this->verify($challengeId, $previousCode)->assertUnprocessable()->assertJsonPath('code', 'mfa_expired');
        $this->verify($newChallengeId, $previousCode)->assertUnprocessable()->assertJsonValidationErrors('code');
        $this->assertGuest();
        $this->verify($newChallengeId, $newCode)->assertOk()->assertJsonPath('data.id', $user->id);
    }

    public function test_resending_extends_expiry_for_another_ten_minutes(): void
    {
        $response = $this->beginLogin($this->user());
        $challengeId = $response->json('data.challenge_id');
        $this->travel(9)->minutes();
        $resent = $this->authPost('/mfa/resend', ['challenge_id' => $challengeId])->assertOk();
        $newChallengeId = $resent->json('data.challenge_id');
        $code = $this->latestCode();

        $this->travel(2)->minutes();

        $this->verify($newChallengeId, $code)->assertOk();
    }

    public function test_mail_delivery_failure_does_not_authenticate_or_expose_transport_secrets(): void
    {
        $user = $this->user();
        Mail::shouldReceive('to')->once()->with($user->email)
            ->andThrow(new RuntimeException('SMTP password: private-app-password'));

        $response = $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertStatus(503)
            ->assertJsonPath('code', 'mfa_delivery_failed');

        $this->assertStringNotContainsString('private-app-password', $response->getContent());
        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    public function test_registration_mail_failure_keeps_account_unauthenticated_and_can_be_recovered_through_login(): void
    {
        $mailFake = Mail::getFacadeRoot();
        Mail::shouldReceive('to')->once()->with('ana@example.org')
            ->andThrow(new RuntimeException('SMTP password: private-app-password'));

        $response = $this->authPost('/register', [
            'name' => 'Ana',
            'email' => 'ana@example.org',
            'password' => 'Password123',
            'password_confirmation' => 'Password123',
            'role' => 'HUESPED',
        ])->assertStatus(503)
            ->assertJsonPath('code', 'mfa_delivery_failed')
            ->assertJsonPath('account_created', true);

        $this->assertStringContainsString('Inicia sesión', $response->json('message'));
        $this->assertStringNotContainsString('private-app-password', $response->getContent());
        $user = User::where('email', 'ana@example.org')->firstOrFail();
        $this->assertNull($user->email_verified_at);
        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();

        Mail::swap($mailFake);
        $loginResponse = $this->beginLogin($user);
        $this->verify($loginResponse->json('data.challenge_id'), $this->latestCode())
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);

        $this->assertAuthenticatedAs($user);
    }

    public function test_restarting_login_during_email_cooldown_does_not_send_another_code(): void
    {
        $user = $this->user();
        $response = $this->beginLogin($user);
        $code = $this->latestCode();
        $this->beginNewSession();

        $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'mfa_resend_throttled')
            ->assertHeader('Retry-After', '60');

        Mail::assertSentCount(1);
        $this->assertGuest();
        $this->verify($response->json('data.challenge_id'), $code)->assertUnprocessable();
    }

    public function test_hourly_email_quota_limits_resends_and_new_sessions(): void
    {
        $user = $this->user();
        $response = $this->beginLogin($user);
        $challengeId = $response->json('data.challenge_id');

        foreach (range(1, 9) as $send) {
            $this->travel(60)->seconds();
            $resent = $this->authPost('/mfa/resend', ['challenge_id' => $challengeId])->assertOk();
            $challengeId = $resent->json('data.challenge_id');
        }

        $this->travel(60)->seconds();
        $this->authPost('/mfa/resend', ['challenge_id' => $challengeId])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'mfa_resend_throttled');
        $this->beginNewSession();
        $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'mfa_resend_throttled');

        Mail::assertSentCount(10);
        $this->assertGuest();

        $this->travel(51)->minutes();
        $newResponse = $this->beginLogin($user);
        $this->verify($newResponse->json('data.challenge_id'), $this->latestCode())->assertOk();
        Mail::assertSentCount(11);
    }

    public function test_tenth_wrong_password_locks_normalized_email_for_twenty_four_hours(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 9);

        $this->authPost('/login', ['email' => ' ANA@EXAMPLE.ORG ', 'password' => 'WrongPassword123'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked')
            ->assertJsonPath('retry_after', 86400)
            ->assertHeader('Retry-After', '86400');

        $this->assertGuest();
        Mail::assertNothingSent();
    }

    public function test_valid_password_does_not_clear_failed_attempts_before_mfa_success(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 9);
        $response = $this->beginLogin($user);

        $this->verify($response->json('data.challenge_id'), $this->wrongCode())
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked')
            ->assertJsonPath('retry_after', 86400);

        $this->verify($response->json('data.challenge_id'), $this->latestCode())
            ->assertUnprocessable()
            ->assertJsonPath('code', 'mfa_expired');
        $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked');

        $this->assertGuest();
    }

    #[DataProvider('cacheStores')]
    public function test_tenth_wrong_email_code_locks_the_account(string $cacheStore): void
    {
        config(['cache.default' => $cacheStore]);
        $user = $this->user();
        $response = $this->beginLogin($user);
        $challengeId = $response->json('data.challenge_id');
        $wrongCode = $this->wrongCode();

        foreach (range(1, 9) as $attempt) {
            $this->verify($challengeId, $wrongCode)->assertUnprocessable()->assertJsonValidationErrors('code');
        }

        $this->verify($challengeId, $wrongCode)
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked')
            ->assertJsonPath('retry_after', 86400)
            ->assertHeader('Retry-After', '86400');

        $this->assertGuest();
    }

    /**
     * @return array<string, array{string}>
     */
    public static function cacheStores(): array
    {
        return [
            'in memory cache' => ['array'],
            'persistent database cache' => ['database'],
        ];
    }

    public function test_resending_does_not_clear_failed_attempts(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 9);
        $response = $this->beginLogin($user);
        $challengeId = $response->json('data.challenge_id');
        $this->travel(60)->seconds();
        $resent = $this->authPost('/mfa/resend', ['challenge_id' => $challengeId])->assertOk();

        $this->verify($resent->json('data.challenge_id'), $this->wrongCode())
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked');

        $this->assertGuest();
    }

    public function test_new_session_and_ip_do_not_bypass_account_lock(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 9);
        $this->authPost('/login', ['email' => $user->email, 'password' => 'WrongPassword123'])->assertTooManyRequests();
        $this->beginNewSession();
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.20']);

        $this->authPost('/login', ['email' => ' ANA@EXAMPLE.ORG ', 'password' => 'Password123'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked')
            ->assertHeader('Retry-After', '86400');

        $this->assertGuest();
        Mail::assertNothingSent();
    }

    public function test_lock_lasts_twenty_four_hours_from_tenth_failure_and_locked_requests_do_not_extend_it(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 9);
        $this->travel(5)->minutes();
        $this->authPost('/login', ['email' => $user->email, 'password' => 'WrongPassword123'])
            ->assertTooManyRequests()
            ->assertJsonPath('retry_after', 86400)
            ->assertHeader('Retry-After', '86400');

        $this->travel(23)->hours();
        $this->travel(59)->minutes();
        $this->travel(59)->seconds();
        $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertTooManyRequests()
            ->assertJsonPath('retry_after', 1)
            ->assertHeader('Retry-After', '1');

        $this->travel(1)->seconds();
        $response = $this->beginLogin($user);
        $this->verify($response->json('data.challenge_id'), $this->latestCode())->assertOk();
    }

    public function test_successful_mfa_clears_the_failed_attempt_counter(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 9);
        $response = $this->beginLogin($user);
        $this->verify($response->json('data.challenge_id'), $this->latestCode())->assertOk();
        $this->authPost('/logout', [])->assertOk();

        $this->failPasswords($user, 9);
        $this->authPost('/login', ['email' => $user->email, 'password' => 'WrongPassword123'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked');
    }

    public function test_starting_a_new_login_invalidates_the_previous_challenge_without_clearing_failures(): void
    {
        $user = $this->user();
        $this->failPasswords($user, 8);
        $firstResponse = $this->beginLogin($user);
        $firstCode = $this->latestCode();
        $this->verify($firstResponse->json('data.challenge_id'), $this->wrongCode())
            ->assertUnprocessable()
            ->assertJsonValidationErrors('code');
        $this->travel(60)->seconds();
        $secondResponse = $this->beginLogin($user);

        $this->verify($firstResponse->json('data.challenge_id'), $firstCode)
            ->assertUnprocessable()
            ->assertJsonPath('code', 'mfa_expired');
        $this->verify($secondResponse->json('data.challenge_id'), $this->wrongCode())
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'auth_locked');

        $this->assertGuest();
    }

    #[DataProvider('accountChanges')]
    public function test_account_changes_invalidate_a_pending_challenge(string $change): void
    {
        $user = $this->user();
        $response = $this->beginLogin($user);
        $code = $this->latestCode();

        $user->forceFill(match ($change) {
            'password' => ['password' => 'NewPassword123'],
            'email' => ['email' => 'updated@example.org'],
            'status' => ['status_id' => Estado::where('descripcion', 'INACTIVO')->value('id')],
            'deleted' => ['deleted_at' => now()],
        })->save();

        $this->verify($response->json('data.challenge_id'), $code)->assertUnprocessable();

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    /**
     * @return array<string, array{string}>
     */
    public static function accountChanges(): array
    {
        return [
            'changed password' => ['password'],
            'changed email' => ['email'],
            'deactivated account' => ['status'],
            'deleted account' => ['deleted'],
        ];
    }

    public function test_cancelling_invalidates_the_challenge_and_keeps_the_session_unauthenticated(): void
    {
        $response = $this->beginLogin($this->user());
        $code = $this->latestCode();

        $this->authPost('/mfa/cancel', ['challenge_id' => $response->json('data.challenge_id')])->assertOk();
        $this->verify($response->json('data.challenge_id'), $code)
            ->assertUnprocessable()
            ->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    private function user(string $role = 'HUESPED'): User
    {
        $user = User::factory()->create([
            'email' => 'ana@example.org',
            'password' => 'Password123',
            'status_id' => Estado::where('descripcion', Estado::ACTIVO)->value('id'),
        ]);
        $user->roles()->attach(Role::where('name', $role)->value('id'), [
            'uuid' => (string) Str::uuid(),
            'assigned_at' => now(),
        ]);

        return $user;
    }

    private function beginLogin(User $user): TestResponse
    {
        $response = $this->authPost('/login', [
            'email' => $user->email,
            'password' => 'Password123',
        ])->assertOk();

        $this->assertChallengeResponse($response);

        return $response;
    }

    private function verify(string $challengeId, string $code): TestResponse
    {
        return $this->authPost('/mfa/verify', ['challenge_id' => $challengeId, 'code' => $code]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function authPost(string $uri, array $data): TestResponse
    {
        $this->app['auth']->forgetGuards();
        $this->withCredentials()->withCookie(config('session.cookie'), $this->app['session']->getId());
        $response = $this->postJson($uri, $data);
        $this->withCookie(config('session.cookie'), $this->app['session']->getId());

        return $response;
    }

    private function beginNewSession(): void
    {
        $this->app['auth']->forgetGuards();
        $this->app['session']->invalidate();
        $this->app['session']->save();
        $this->withCookie(config('session.cookie'), $this->app['session']->getId());
    }

    private function latestCode(): string
    {
        $mail = Mail::sent(AuthVerificationCode::class)->last();
        $this->assertInstanceOf(AuthVerificationCode::class, $mail);
        $this->assertMatchesRegularExpression('/^\d{6}$/', $mail->code);

        return $mail->code;
    }

    private function wrongCode(): string
    {
        return $this->latestCode() === '000000' ? '111111' : '000000';
    }

    private function failPasswords(User $user, int $attempts): void
    {
        foreach (range(1, $attempts) as $attempt) {
            $this->authPost('/login', ['email' => $user->email, 'password' => 'WrongPassword123'])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('password');
        }
    }

    private function assertChallengeResponse(TestResponse $response): void
    {
        $response->assertJsonPath('data.status', 'mfa_required')
            ->assertJsonPath('data.method', 'email')
            ->assertJsonPath('data.resend_after', 60)
            ->assertJsonStructure(['data' => ['challenge_id', 'masked_email', 'expires_at']]);

        $this->assertTrue(Str::isUuid($response->json('data.challenge_id')));
        $this->assertNotSame('ana@example.org', $response->json('data.masked_email'));
        $this->assertStringContainsString('@example.org', $response->json('data.masked_email'));
        $this->assertSame(now()->addMinutes(10)->timestamp, Carbon::parse($response->json('data.expires_at'))->timestamp);
        $this->assertArrayNotHasKey('code', $response->json('data'));
        $this->assertArrayNotHasKey('password', $response->json('data'));

        $this->assertGuest();
    }
}
