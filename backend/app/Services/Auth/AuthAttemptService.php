<?php

namespace App\Services\Auth;

use Closure;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AuthAttemptService
{
    public function normalizeEmail(string $email): string
    {
        return Str::lower(trim($email));
    }

    public function withAccountLock(string $email, Closure $callback): mixed
    {
        $email = $this->normalizeEmail($email);

        return Cache::lock($this->cacheKey($email).':lock', 30)
            ->block(10, fn (): mixed => $callback($email));
    }

    public function ensureNotLocked(string $email): void
    {
        $key = $this->cacheKey($email);
        $state = Cache::get($key, []);
        $lockedUntil = (int) ($state['locked_until'] ?? 0);

        if ($lockedUntil === 0) {
            return;
        }

        $retryAfter = $lockedUntil - now()->timestamp;

        if ($retryAfter > 0) {
            $this->throwLockout($retryAfter);
        }

        Cache::forget($key);
    }

    public function recordFailure(string $email): void
    {
        $this->ensureNotLocked($email);

        $key = $this->cacheKey($email);
        $state = Cache::get($key, []);
        $failures = (int) ($state['failures'] ?? 0) + 1;
        $lockoutSeconds = (int) config('mfa.lockout_seconds');
        $lockedUntil = $failures >= (int) config('mfa.max_failed_attempts')
            ? now()->timestamp + $lockoutSeconds
            : null;

        Cache::forever($key, [
            'failures' => $failures,
            'locked_until' => $lockedUntil,
        ]);

        if ($lockedUntil !== null) {
            $this->throwLockout($lockoutSeconds);
        }
    }

    public function clearFailures(string $email): void
    {
        Cache::forget($this->cacheKey($email));
    }

    private function cacheKey(string $email): string
    {
        return 'auth:mfa:attempts:'.hash('sha256', $this->normalizeEmail($email));
    }

    private function throwLockout(int $retryAfter): never
    {
        if (request()->hasSession()) {
            request()->session()->forget(AuthChallengeService::SESSION_KEY);
        }

        throw new HttpResponseException(response()->json([
            'message' => 'El acceso está bloqueado durante 24 horas por 10 intentos fallidos. Inténtalo de nuevo cuando termine el bloqueo.',
            'code' => 'auth_locked',
            'retry_after' => $retryAfter,
        ], 429, ['Retry-After' => (string) $retryAfter]));
    }
}
