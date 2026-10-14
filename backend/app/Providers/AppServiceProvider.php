<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth-requests', function (Request $request): Limit {
            return Limit::perMinute((int) config('mfa.http_requests_per_minute'))
                ->by('auth:'.$request->ip());
        });

        RateLimiter::for('password-recovery', function (Request $request): Limit {
            return Limit::perMinute(5)
                ->by('password-recovery:'.$request->ip())
                ->response(function (Request $request, array $headers): JsonResponse {
                    return response()->json([
                        'message' => 'Has realizado demasiadas solicitudes. Espera un momento y vuelve a intentarlo.',
                        'code' => 'password_recovery_throttled',
                        'retry_after' => (int) ($headers['Retry-After'] ?? 60),
                    ], 429, $headers);
                });
        });

        ResetPassword::toMailUsing(function (User $user, string $token): MailMessage {
            $url = rtrim((string) config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ], '', '&', PHP_QUERY_RFC3986);
            $expiresIn = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

            return (new MailMessage)
                ->subject('Cambia tu contraseña de ComfortStyle')
                ->greeting('Hola,')
                ->line('Recibimos una solicitud para cambiar la contraseña de tu cuenta de ComfortStyle.')
                ->action('Cambiar contraseña', $url)
                ->line('Este enlace vence en '.$expiresIn.' minutos y solo puede usarse una vez.')
                ->line('Si no solicitaste este cambio, puedes ignorar este correo.')
                ->salutation('Equipo ComfortStyle');
        });
    }
}
