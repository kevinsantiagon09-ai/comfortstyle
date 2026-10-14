<?php

namespace App\Services\Auth;

use App\Mail\AuthVerificationCode;
use App\Models\User;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Throwable;

class AuthChallengeService
{
    public const string SESSION_KEY = 'auth.mfa_challenge';

    public function __construct(
        protected AuthAttemptService $attempts,
        protected AuthService $authService
    ) {}

    /**
     * @return array{status: string, challenge_id: string, method: string, masked_email: string, expires_at: string, resend_after: int}
     */
    public function start(User $user): array
    {
        return $this->attempts->withAccountLock($user->email, function (string $email) use ($user): array {
            $this->attempts->ensureNotLocked($email);

            $currentUser = User::with('status')->find($user->id);

            if ($currentUser === null || ! $currentUser->isActive()
                || ! hash_equals($user->email, $currentUser->email)
                || ! hash_equals($user->getAuthPassword(), $currentUser->getAuthPassword())) {
                $this->throwExpired();
            }

            return $this->sendChallenge($currentUser, request()->session()->get(self::SESSION_KEY));
        });
    }

    public function verify(string $challengeId, string $code): User
    {
        $challenge = $this->requireChallenge($challengeId);

        return $this->attempts->withAccountLock($challenge['email'], function (string $email) use ($challengeId, $code): User {
            $this->attempts->ensureNotLocked($email);
            $challenge = $this->requireChallenge($challengeId);

            $user = DB::transaction(function () use ($challenge, $code): ?User {
                $user = $this->requireCurrentUser($challenge, true);

                $codeMatches = Hash::check($code, $challenge['code_hash']);
                $this->requireChallenge($challenge['challenge_id']);

                if (! $codeMatches) {
                    return null;
                }

                if ($user->email_verified_at === null) {
                    $user->forceFill(['email_verified_at' => now()])->save();
                }

                return $user;
            });

            if ($user === null) {
                $this->attempts->recordFailure($email);

                throw ValidationException::withMessages([
                    'code' => ['El código de verificación es incorrecto.'],
                ]);
            }

            $this->requireChallenge($challengeId);
            request()->session()->forget(self::SESSION_KEY);

            $authenticatedUser = $this->authService->login($user);

            $this->attempts->clearFailures($email);

            return $authenticatedUser;
        });
    }

    /**
     * @return array{status: string, challenge_id: string, method: string, masked_email: string, expires_at: string, resend_after: int}
     */
    public function resend(string $challengeId): array
    {
        $challenge = $this->requireChallenge($challengeId);

        return $this->attempts->withAccountLock($challenge['email'], function (string $email) use ($challengeId): array {
            $this->attempts->ensureNotLocked($email);
            $challenge = $this->requireChallenge($challengeId);

            return $this->sendChallenge($this->requireCurrentUser($challenge), $challenge);
        });
    }

    public function cancel(string $challengeId): void
    {
        $challenge = request()->session()->get(self::SESSION_KEY);

        if (! is_array($challenge) || ! hash_equals($challenge['challenge_id'], $challengeId)) {
            $this->throwExpired(false);
        }

        request()->session()->forget(self::SESSION_KEY);
        request()->session()->regenerate(true);
    }

    /**
     * @return array{challenge_id: string, user_id: int, email: string, password_fingerprint: string, code_hash: string, expires_at: int, sent_at: int}
     */
    private function requireChallenge(string $challengeId): array
    {
        $challenge = request()->session()->get(self::SESSION_KEY);

        if (! is_array($challenge) || ! hash_equals($challenge['challenge_id'], $challengeId)) {
            $this->throwExpired(false);
        }

        if ((int) $challenge['expires_at'] <= now()->timestamp) {
            $this->throwExpired();
        }

        return $challenge;
    }

    /**
     * @param  array{challenge_id: string, user_id: int, email: string, password_fingerprint: string, code_hash: string, expires_at: int, sent_at: int}  $challenge
     */
    private function requireCurrentUser(array $challenge, bool $lockForUpdate = false): User
    {
        $query = User::with('status')->whereKey($challenge['user_id']);

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        $user = $query->first();

        if ($user === null || ! $user->isActive()
            || ! hash_equals($challenge['email'], $user->email)
            || ! hash_equals($challenge['password_fingerprint'], $this->passwordFingerprint($user))) {
            $this->throwExpired();
        }

        return $user;
    }

    /**
     * @param  array{code_hash: string}|null  $previousChallenge
     * @return array{status: string, challenge_id: string, method: string, masked_email: string, expires_at: string, resend_after: int}
     */
    private function sendChallenge(User $user, ?array $previousChallenge): array
    {
        $sendKey = 'auth:mfa:email-sends:'.hash('sha256', $this->attempts->normalizeEmail($user->email));
        $previousSends = Cache::get($sendKey);
        $now = now()->timestamp;
        $sends = is_array($previousSends) ? $previousSends : [];
        $lastSentAt = (int) ($sends['last_sent_at'] ?? 0);
        $cooldown = (int) config('mfa.resend_cooldown_seconds');
        $cooldownRemaining = $lastSentAt + $cooldown - $now;

        if ($cooldownRemaining > 0) {
            $this->throwSendThrottle($cooldownRemaining);
        }

        $windowStartedAt = (int) ($sends['window_started_at'] ?? $now);
        $sentCount = (int) ($sends['sent_count'] ?? 0);

        if ($windowStartedAt + 3600 <= $now) {
            $windowStartedAt = $now;
            $sentCount = 0;
        }

        if ($sentCount >= (int) config('mfa.max_email_sends_per_hour')) {
            $this->throwSendThrottle($windowStartedAt + 3600 - $now);
        }

        do {
            $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while ($previousChallenge !== null && Hash::check($code, $previousChallenge['code_hash']));

        $challenge = [
            'challenge_id' => (string) Str::uuid(),
            'user_id' => $user->id,
            'email' => $user->email,
            'password_fingerprint' => $this->passwordFingerprint($user),
            'code_hash' => Hash::make($code),
            'expires_at' => $now + (int) config('mfa.code_ttl_seconds'),
            'sent_at' => $now,
        ];

        Cache::put($sendKey, [
            'last_sent_at' => $now,
            'window_started_at' => $windowStartedAt,
            'sent_count' => $sentCount + 1,
        ], 3600);

        try {
            Mail::to($user->email)->send(new AuthVerificationCode($code));
        } catch (Throwable $exception) {
            if ($previousSends === null) {
                Cache::forget($sendKey);
            } else {
                Cache::put($sendKey, $previousSends, 3600);
            }

            Log::warning('No se pudo enviar el código de autenticación.', [
                'user_id' => $user->id,
                'exception' => $exception::class,
            ]);

            throw new HttpResponseException(response()->json([
                'message' => 'No pudimos enviar el código de verificación. Inténtalo de nuevo en unos momentos.',
                'code' => 'mfa_delivery_failed',
            ], 503));
        }

        request()->session()->regenerate(true);
        request()->session()->put(self::SESSION_KEY, $challenge);

        return [
            'status' => 'mfa_required',
            'challenge_id' => $challenge['challenge_id'],
            'method' => 'email',
            'masked_email' => $this->maskedEmail($user->email),
            'expires_at' => now()->setTimestamp($challenge['expires_at'])->toIso8601String(),
            'resend_after' => $cooldown,
        ];
    }

    private function passwordFingerprint(User $user): string
    {
        return hash('sha256', $user->getAuthPassword());
    }

    private function maskedEmail(string $email): string
    {
        [$name, $domain] = explode('@', $email, 2);

        return Str::substr($name, 0, 1).str_repeat('*', max(3, Str::length($name) - 1)).'@'.$domain;
    }

    private function throwExpired(bool $forgetChallenge = true): never
    {
        if ($forgetChallenge) {
            request()->session()->forget(self::SESSION_KEY);
        }

        $message = 'La verificación venció o ya no está disponible. Inicia sesión nuevamente.';

        throw new HttpResponseException(response()->json([
            'message' => $message,
            'code' => 'mfa_expired',
            'errors' => ['challenge_id' => [$message]],
        ], 422));
    }

    private function throwSendThrottle(int $retryAfter): never
    {
        throw new HttpResponseException(response()->json([
            'message' => 'Espera antes de solicitar otro código de verificación.',
            'code' => 'mfa_resend_throttled',
            'retry_after' => $retryAfter,
        ], 429, ['Retry-After' => (string) $retryAfter]));
    }
}
