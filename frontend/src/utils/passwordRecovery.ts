export const passwordRecoveryNotice = 'Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.';

export const isRecoveryEmail = (email: string) => email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/** Solo acepta un token y un correo; nunca traslada el token a otras rutas. */
export function readPasswordRecoveryLink(search: string) {
    const params = new URLSearchParams(search);
    const email = params.get('email')?.trim() ?? '';
    const token = params.get('token') ?? '';
    return {
        email,
        token,
        valid: params.getAll('token').length === 1
            && params.getAll('email').length === 1
            && /^[a-f0-9]{64}$/i.test(token)
            && isRecoveryEmail(email),
    };
}

export function recoveryRetryAfter(header: unknown, body?: number) {
    const value = header == null ? '' : String(header);
    const seconds = Number(value);
    if (value && Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds));
    const date = value ? Date.parse(value) : NaN;
    if (Number.isFinite(date)) return Math.max(1, Math.ceil((date - Date.now()) / 1000));
    return body !== undefined && Number.isFinite(body) ? Math.max(1, Math.ceil(body)) : 60;
}
