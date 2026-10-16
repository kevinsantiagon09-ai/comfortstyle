import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { sessionHttp } from '../api/http';

const env = import.meta.env;
let echo: Echo<'reverb'> | null = null;

/**
 * Conexión única con Laravel Reverb. Se abre al primer uso (con sesión iniciada) y se cierra al salir.
 * El canal privado se autoriza con la cookie de sesión y el token CSRF, igual que el resto de la app.
 */
export function getEcho() {
    echo ??= new Echo({
        broadcaster: 'reverb',
        Pusher,
        key: env.VITE_REVERB_APP_KEY,
        wsHost: env.VITE_REVERB_HOST,
        wsPort: Number(env.VITE_REVERB_PORT ?? 80),
        wssPort: Number(env.VITE_REVERB_PORT ?? 443),
        forceTLS: (env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authorizer: (channel) => ({
            authorize: (socketId, callback) => {
                sessionHttp.post('/broadcasting/auth', { socket_id: socketId, channel_name: channel.name })
                    .then((response) => callback(null, response.data))
                    .catch((error: Error) => callback(error, null));
            },
        }),
    });
    return echo;
}

export function disconnectEcho() {
    echo?.disconnect();
    echo = null;
}

/** Sin llave configurada no se intenta conectar: la campana sigue funcionando con la consulta normal. */
export const realtimeEnabled = Boolean(env.VITE_REVERB_APP_KEY);
