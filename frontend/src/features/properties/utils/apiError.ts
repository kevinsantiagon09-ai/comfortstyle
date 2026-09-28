import { isAxiosError } from 'axios';
export function apiError(error: unknown): string {
    if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
        if (error.response?.status === 401) return 'Tu sesión terminó. Inicia sesión para continuar con tu alojamiento.';
        if (error.response?.status === 419) return 'La sesión caducó. Recarga la página e inténtalo de nuevo.';
        return Object.values(error.response?.data.errors ?? {}).flat().join(' ') || error.response?.data.message || 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
    }
    return 'No pudimos completar la operación. Inténtalo de nuevo.';
}

/** Errores de validación del backend por campo; `images.0` se agrupa en `images`. */
export function fieldErrors(error: unknown): Record<string, string> {
    if (!isAxiosError<{ errors?: Record<string, string[]> }>(error) || error.response?.status !== 422) return {};
    const result: Record<string, string> = {};
    for (const [key, messages] of Object.entries(error.response.data.errors ?? {})) {
        const field = key.split('.')[0];
        result[field] = result[field] ? `${result[field]} ${messages[0]}` : messages[0];
    }
    return result;
}
