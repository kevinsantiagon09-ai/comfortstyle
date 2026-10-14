<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\PasswordResetLinkSent;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Throwable;

class PasswordRecoveryService
{
    public function __construct(protected AuthAttemptService $attempts) {}

    public function sendResetLink(string $email): void
    {
        $this->attempts->withAccountLock($email, function (string $email): void {
            $user = $this->findUser($email);

            if ($user === null || ! $user->isActive()) {
                return;
            }

            $broker = Password::broker();

            $broker->sendResetLink([
                'email' => $user->email,
                'deleted_at' => null,
            ], function (User $notifiable, string $token) use ($broker, $user): string {
                $notifiable->refresh()->load('status');

                if ($notifiable->id !== $user->id || ! $notifiable->isActive()
                    || ! hash_equals($user->email, $notifiable->email)) {
                    $broker->deleteToken($user);

                    return Password::INVALID_USER;
                }

                try {
                    $notifiable->sendPasswordResetNotification($token);
                } catch (Throwable $exception) {
                    $broker->deleteToken($notifiable);

                    Log::warning('No se pudo enviar el enlace para cambiar la contraseña.', [
                        'user_id' => $notifiable->id,
                        'exception' => $exception::class,
                    ]);

                    throw new HttpResponseException(response()->json([
                        'message' => 'No pudimos enviar el enlace para cambiar tu contraseña. Inténtalo de nuevo en unos momentos.',
                        'code' => 'password_reset_delivery_failed',
                    ], 503));
                }

                event(new PasswordResetLinkSent($notifiable));

                return Password::RESET_LINK_SENT;
            });
        });
    }

    /**
     * @param  array{email: string, token: string, password: string, password_confirmation?: string}  $credentials
     */
    public function resetPassword(array $credentials): void
    {
        $this->attempts->withAccountLock($credentials['email'], function (string $email) use ($credentials): void {
            DB::transaction(function () use ($email, $credentials): void {
                $currentUser = $this->findUser($email, true);

                if ($currentUser === null || ! $currentUser->isActive()) {
                    $this->throwInvalidLink();
                }

                $status = Password::broker()->reset([
                    'email' => $currentUser->email,
                    'deleted_at' => null,
                    'token' => $credentials['token'],
                    'password' => $credentials['password'],
                ], function (User $user, string $password) use ($currentUser): void {
                    $user->load('status');

                    if ($user->id !== $currentUser->id || ! $user->isActive()
                        || ! hash_equals($currentUser->email, $user->email)) {
                        $this->throwInvalidLink();
                    }

                    $user->forceFill([
                        'password' => Hash::make($password),
                        'remember_token' => Str::random(60),
                    ])->save();

                    $this->revokeDatabaseSessions($user);

                    event(new PasswordReset($user));
                });

                if ($status !== Password::PASSWORD_RESET) {
                    $this->throwInvalidLink();
                }
            });

            if (request()->hasSession()) {
                request()->session()->forget(AuthChallengeService::SESSION_KEY);
                request()->session()->regenerate(true);
            }
        });
    }

    private function findUser(string $email, bool $lockForUpdate = false): ?User
    {
        $query = User::with('status')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('deleted_at');

        if ($lockForUpdate) {
            $query->lockForUpdate();
        }

        return $query->first();
    }

    private function revokeDatabaseSessions(User $user): void
    {
        if (config('session.driver') !== 'database') {
            return;
        }

        DB::connection(config('session.connection'))
            ->table(config('session.table', 'sessions'))
            ->where('user_id', $user->id)
            ->delete();
    }

    private function throwInvalidLink(): never
    {
        $message = 'El enlace para cambiar la contraseña no es válido o ha vencido. Solicita uno nuevo.';

        throw new HttpResponseException(response()->json([
            'message' => $message,
            'code' => 'password_reset_invalid',
            'errors' => ['token' => [$message]],
        ], 422));
    }
}
