<?php

namespace Tests\Feature;

use App\Mail\AuthVerificationCode;
use App\Models\Estado;
use App\Models\User;
use App\Services\Auth\AuthAttemptService;
use App\Services\Auth\AuthChallengeService;
use Closure;
use Database\Seeders\EstadoSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Testing\TestResponse;
use Mockery\MockInterface;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([RoleSeeder::class, EstadoSeeder::class]);
        Notification::fake();
        Mail::fake();
        $this->freezeTime();
        config(['app.frontend_url' => 'https://comfortstyle.example']);
    }

    public function test_registered_and_unknown_addresses_receive_the_same_public_response(): void
    {
        $user = $this->user();

        $registered = $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();
        $unknown = $this->authPost('/forgot-password', ['email' => 'unknown@example.org'])->assertOk();

        $this->assertSame($registered->json(), $unknown->json());
        $registered->assertJsonPath('resend_after', 60)->assertJsonStructure(['message']);
        Notification::assertSentTo($user, ResetPassword::class);
        Notification::assertCount(1);
        $notification = $this->notification($user);
        $storedToken = DB::table('password_reset_tokens')->where('email', $user->email)->value('token');
        $this->assertNotSame($notification->token, $storedToken);
        $this->assertTrue(Hash::check($notification->token, $storedToken));
        $this->assertStringNotContainsString($notification->token, $registered->getContent());
        $this->assertStringNotContainsString($user->email, $registered->getContent());
        $this->assertGuest();
    }

    public function test_recovery_and_reset_normalize_input_and_use_the_stored_email_for_the_token(): void
    {
        $user = $this->user(['email' => 'Ana.Test+tag@example.org']);
        $this->authPost('/forgot-password', ['email' => ' ANA.TEST+TAG@EXAMPLE.ORG '])->assertOk();

        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
        $this->reset($user, $this->notification($user)->token, ['email' => ' ANA.TEST+TAG@EXAMPLE.ORG '])
            ->assertOk();

        $this->assertTrue(Hash::check('NewPassword456', $user->fresh()->password));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
    }

    #[DataProvider('unavailableAccounts')]
    public function test_inactive_deleted_or_unclassified_accounts_are_not_sent_recovery_links(string $state): void
    {
        $user = $this->user(match ($state) {
            'inactive' => ['status_id' => Estado::where('descripcion', 'INACTIVO')->value('id')],
            'deleted' => ['deleted_at' => now()],
            'unclassified' => ['status_id' => null],
        });

        $response = $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();
        $unknown = $this->authPost('/forgot-password', ['email' => 'unknown@example.org'])->assertOk();

        $this->assertSame($unknown->json(), $response->json());
        Notification::assertNothingSent();
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    /**
     * @return array<string, array{string}>
     */
    public static function unavailableAccounts(): array
    {
        return [
            'inactive account' => ['inactive'],
            'deleted account' => ['deleted'],
            'account without status' => ['unclassified'],
        ];
    }

    public function test_recovery_requires_a_valid_email_address(): void
    {
        $this->authPost('/forgot-password', [])->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->authPost('/forgot-password', ['email' => 'not-an-email'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        Notification::assertNothingSent();
    }

    public function test_email_contains_a_spanish_expiring_link_on_the_trusted_frontend_host(): void
    {
        $user = $this->user(['email' => 'ana+recovery@example.org']);

        $this->authPost('http://attacker.example/forgot-password', ['email' => $user->email])->assertOk();

        $notification = $this->notification($user);
        $message = $notification->toMail($user);
        $parts = parse_url($message->actionUrl);
        parse_str($parts['query'], $query);

        $this->assertSame('https', $parts['scheme']);
        $this->assertSame('comfortstyle.example', $parts['host']);
        $this->assertSame('/reset-password', $parts['path']);
        $this->assertSame($notification->token, $query['token']);
        $this->assertSame($user->email, $query['email']);
        $this->assertStringContainsString('ana%2Brecovery%40example.org', $message->actionUrl);
        $this->assertStringContainsString('contrase', $message->subject);
        $this->assertStringContainsString('60', implode(' ', $message->introLines).' '.implode(' ', $message->outroLines));
    }

    public function test_repeated_requests_respect_the_email_cooldown_without_replacing_the_valid_token(): void
    {
        $user = $this->user();
        $first = $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();
        $firstToken = $this->notification($user)->token;
        $storedToken = DB::table('password_reset_tokens')->where('email', $user->email)->value('token');

        $second = $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();

        $this->assertSame($first->json(), $second->json());
        Notification::assertSentToTimes($user, ResetPassword::class, 1);
        $this->assertSame($storedToken, DB::table('password_reset_tokens')->where('email', $user->email)->value('token'));

        $this->travel(60)->seconds();
        $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();
        Notification::assertSentToTimes($user, ResetPassword::class, 2);
        $this->assertNotSame($firstToken, $this->notification($user)->token);
        $this->reset($user, $firstToken)->assertUnprocessable()->assertJsonPath('code', 'password_reset_invalid');
    }

    public function test_recovery_requests_are_limited_to_five_per_minute_per_ip(): void
    {
        foreach (range(1, 5) as $attempt) {
            $this->authPost('/forgot-password', ['email' => 'unknown'.$attempt.'@example.org'])->assertOk();
        }

        $this->authPost('/forgot-password', ['email' => 'another@example.org'])
            ->assertTooManyRequests()->assertHeader('Retry-After')
            ->assertJsonPath('code', 'password_recovery_throttled')
            ->assertJsonPath('retry_after', 60);

        Notification::assertNothingSent();
    }

    public function test_password_reset_rotates_credentials_and_still_requires_mfa_for_the_next_login(): void
    {
        $user = $this->user(['remember_token' => 'previous-remember-token']);
        $previousHash = $user->password;
        $token = $this->issueToken($user);

        $response = $this->reset($user, $token)->assertOk()->assertJsonStructure(['message']);

        $updated = $user->fresh();
        $this->assertNotSame($previousHash, $updated->password);
        $this->assertTrue(Hash::check('NewPassword456', $updated->password));
        $this->assertFalse(Hash::check('Password123', $updated->password));
        $this->assertNotSame('previous-remember-token', $updated->remember_token);
        $this->assertNotEmpty($updated->remember_token);
        $this->assertStringNotContainsString($token, $response->getContent());
        $this->assertStringNotContainsString('NewPassword456', $response->getContent());
        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);

        $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->authPost('/login', ['email' => $user->email, 'password' => 'NewPassword456'])
            ->assertOk()->assertJsonPath('data.status', 'mfa_required');
        Mail::assertSent(AuthVerificationCode::class);
        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    #[DataProvider('invalidResetLinks')]
    public function test_invalid_expired_reused_or_wrong_account_links_cannot_change_the_password(string $invalidity): void
    {
        $user = $this->user();
        $token = $this->issueToken($user);
        $email = $user->email;

        if ($invalidity === 'invalid') {
            $token = 'invalid-token';
        } elseif ($invalidity === 'expired') {
            $this->travel(61)->minutes();
        } elseif ($invalidity === 'reused') {
            $this->reset($user, $token)->assertOk();
        } elseif ($invalidity === 'wrong-account') {
            $email = $this->user(['email' => 'other@example.org'])->email;
        }

        $passwordBeforeRequest = $user->fresh()->password;
        $this->reset($user, $token, ['email' => $email, 'password' => 'AnotherPassword789', 'password_confirmation' => 'AnotherPassword789'])
            ->assertUnprocessable()
            ->assertJsonPath('code', 'password_reset_invalid')
            ->assertJsonValidationErrors('token');

        $this->assertSame($passwordBeforeRequest, $user->fresh()->password);
        $this->assertGuest();
    }

    /**
     * @return array<string, array{string}>
     */
    public static function invalidResetLinks(): array
    {
        return [
            'wrong token' => ['invalid'],
            'expired link' => ['expired'],
            'used link' => ['reused'],
            'different account' => ['wrong-account'],
        ];
    }

    #[DataProvider('invalidPasswords')]
    public function test_new_password_must_meet_strength_and_confirmation_requirements(string $password, string $confirmation): void
    {
        $user = $this->user();
        $token = $this->issueToken($user);
        $previousHash = $user->password;

        $this->reset($user, $token, ['password' => $password, 'password_confirmation' => $confirmation])
            ->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->assertSame($previousHash, $user->fresh()->password);
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function invalidPasswords(): array
    {
        return [
            'too short' => ['Abc1234', 'Abc1234'],
            'missing letters' => ['12345678', '12345678'],
            'missing numbers' => ['OnlyLetters', 'OnlyLetters'],
            'does not match confirmation' => ['NewPassword456', 'DifferentPassword789'],
        ];
    }

    public function test_an_account_deactivated_after_receiving_the_link_cannot_reset_its_password(): void
    {
        $user = $this->user();
        $token = $this->issueToken($user);
        $user->forceFill(['status_id' => Estado::where('descripcion', 'INACTIVO')->value('id')])->save();
        $previousHash = $user->password;

        $this->reset($user, $token)->assertUnprocessable()->assertJsonPath('code', 'password_reset_invalid');

        $this->assertSame($previousHash, $user->fresh()->password);
        $this->assertGuest();
    }

    public function test_password_reset_invalidates_a_pending_mfa_code(): void
    {
        $user = $this->user();
        $login = $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])
            ->assertOk()->assertJsonPath('data.status', 'mfa_required');
        $code = Mail::sent(AuthVerificationCode::class)->last()->code;
        $token = $this->issueToken($user);

        $this->reset($user, $token)->assertOk();
        $this->authPost('/mfa/verify', ['challenge_id' => $login->json('data.challenge_id'), 'code' => $code])
            ->assertUnprocessable()->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    public function test_password_reset_rejects_an_old_mfa_challenge_still_present_in_another_session(): void
    {
        $user = $this->user();
        $login = $this->authPost('/login', ['email' => $user->email, 'password' => 'Password123'])->assertOk();
        $code = Mail::sent(AuthVerificationCode::class)->last()->code;
        $pendingChallenge = $this->app['session']->get(AuthChallengeService::SESSION_KEY);
        $token = $this->issueToken($user);

        $this->reset($user, $token)->assertOk();
        $this->withSession([AuthChallengeService::SESSION_KEY => $pendingChallenge]);
        $this->authPost('/mfa/verify', ['challenge_id' => $login->json('data.challenge_id'), 'code' => $code])
            ->assertUnprocessable()->assertJsonPath('code', 'mfa_expired');

        $this->assertGuest();
        $this->getJson('/me')->assertUnauthorized();
    }

    public function test_password_reset_preserves_the_remaining_twenty_four_hour_login_lock(): void
    {
        $user = $this->user();
        foreach (range(1, 9) as $attempt) {
            $this->authPost('/login', ['email' => $user->email, 'password' => 'WrongPassword123'])->assertUnprocessable();
        }
        $this->authPost('/login', ['email' => $user->email, 'password' => 'WrongPassword123'])
            ->assertTooManyRequests()->assertJsonPath('code', 'auth_locked')->assertHeader('Retry-After', '86400');
        $this->travel(10)->minutes();

        $token = $this->issueToken($user);
        $this->reset($user, $token)->assertOk();

        $this->authPost('/login', ['email' => $user->email, 'password' => 'NewPassword456'])
            ->assertTooManyRequests()->assertJsonPath('code', 'auth_locked')->assertHeader('Retry-After', '85800');
        $this->assertGuest();
    }

    public function test_delivery_failure_hides_transport_secrets_and_allows_an_immediate_retry(): void
    {
        $user = $this->user();
        $notificationFake = Notification::getFacadeRoot();
        Notification::shouldReceive('send')->once()
            ->andThrow(new RuntimeException('SMTP password: secret-app-password'));

        $response = $this->authPost('/forgot-password', ['email' => $user->email])
            ->assertStatus(503)->assertJsonPath('code', 'password_reset_delivery_failed');

        $this->assertStringNotContainsString('secret-app-password', $response->getContent());
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);
        $this->assertGuest();

        Notification::swap($notificationFake);
        $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();
        Notification::assertSentToTimes($user, ResetPassword::class, 1);
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $user->email]);
    }

    public function test_successful_reset_revokes_database_sessions_for_only_the_target_account(): void
    {
        $user = $this->user();
        $otherUser = $this->user(['email' => 'other@example.org']);
        $token = $this->issueToken($user);
        DB::table('sessions')->insert([
            ['id' => 'target-one', 'user_id' => $user->id, 'payload' => '', 'last_activity' => now()->timestamp],
            ['id' => 'target-two', 'user_id' => $user->id, 'payload' => '', 'last_activity' => now()->timestamp],
            ['id' => 'other-user', 'user_id' => $otherUser->id, 'payload' => '', 'last_activity' => now()->timestamp],
        ]);
        config(['session.driver' => 'database']);

        $this->reset($user, $token)->assertOk();

        $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
        $this->assertDatabaseHas('sessions', ['id' => 'other-user', 'user_id' => $otherUser->id]);
        $this->assertGuest();
    }

    public function test_token_that_expires_while_waiting_for_the_account_lock_cannot_change_the_password(): void
    {
        $user = $this->user();
        $token = $this->issueToken($user);
        $previousHash = $user->password;
        $this->travel(3599)->seconds();
        $this->partialMock(AuthAttemptService::class, function (MockInterface $mock) use ($user): void {
            $mock->shouldReceive('withAccountLock')->once()->with($user->email, \Mockery::type(Closure::class))
                ->andReturnUsing(function (string $email, Closure $callback): mixed {
                    $this->travel(2)->seconds();

                    return $callback($email);
                });
        });

        $this->reset($user, $token)->assertUnprocessable()->assertJsonPath('code', 'password_reset_invalid');

        $this->assertSame($previousHash, $user->fresh()->password);
        $this->assertGuest();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function user(array $attributes = []): User
    {
        return User::factory()->create(array_replace([
            'email' => 'ana@example.org',
            'password' => 'Password123',
            'status_id' => Estado::where('descripcion', Estado::ACTIVO)->value('id'),
        ], $attributes));
    }

    private function issueToken(User $user): string
    {
        $this->authPost('/forgot-password', ['email' => $user->email])->assertOk();

        return $this->notification($user)->token;
    }

    private function notification(User $user): ResetPassword
    {
        $notification = Notification::sent($user, ResetPassword::class)->last();
        $this->assertInstanceOf(ResetPassword::class, $notification);

        return $notification;
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function reset(User $user, string $token, array $overrides = []): TestResponse
    {
        return $this->authPost('/reset-password', array_replace([
            'token' => $token,
            'email' => $user->email,
            'password' => 'NewPassword456',
            'password_confirmation' => 'NewPassword456',
        ], $overrides));
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
}
