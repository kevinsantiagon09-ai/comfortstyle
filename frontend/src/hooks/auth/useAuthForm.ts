import { useEffect, useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '../../types/api';
import type { AuthField, AuthFieldErrors, AuthFormPhase, MfaChallenge, UserRole } from '../../types/auth';
import { dashboardPath } from '../../utils/auth';
import { useAuth } from './useAuth';
import { useCancelMfa } from './useCancelMfa';
import { useLogin } from './useLogin';
import { useRegister } from './useRegister';
import { useResendMfa } from './useResendMfa';
import { useVerifyMfa } from './useVerifyMfa';

const authFields: AuthField[] = ['name', 'email', 'password', 'password_confirmation', 'role', 'code'];
type AuthOperation = 'credentials' | 'verify' | 'resend' | 'cancel';

function retryAfterSeconds(header: unknown, body: number | undefined, now: number, fallback: number) {
    const value = header == null ? '' : String(header);
    const seconds = Number(value);
    if (value && Number.isFinite(seconds)) return Math.max(1, Math.ceil(seconds));
    const date = value ? Date.parse(value) : NaN;
    if (Number.isFinite(date)) return Math.max(1, Math.ceil((date - now) / 1000));
    return body !== undefined && Number.isFinite(body) ? Math.max(1, Math.ceil(body)) : fallback;
}

export function useAuthForm(registerMode: boolean) {
    const { user, loading } = useAuth();
    const login = useLogin();
    const register = useRegister();
    const verify = useVerifyMfa();
    const resend = useResendMfa();
    const cancel = useCancelMfa();
    const [phase, setPhase] = useState<AuthFormPhase>({ step: 'credentials' });
    const [accountCreated, setAccountCreated] = useState(false);
    const [credentials, setCredentials] = useState({ name: '', email: '', role: 'HUESPED' as UserRole });
    const [credentialVersion, setCredentialVersion] = useState(0);
    const [code, setCode] = useState('');
    const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
    const [formError, setFormError] = useState('');
    const [notice, setNotice] = useState('');
    const [lock, setLock] = useState<{ until: number; message: string } | null>(null);
    const [now, setNow] = useState(() => Date.now());
    const effectiveRegisterMode = registerMode && !accountCreated;
    const pending = login.isPending || register.isPending || verify.isPending || resend.isPending || cancel.isPending;
    const expiresAt = phase.step === 'mfa' ? Date.parse(phase.challenge.expires_at) : null;
    const lockSeconds = Math.max(0, Math.ceil(((lock?.until ?? now) - now) / 1000));
    const expiresIn = Math.max(0, Math.ceil(((expiresAt ?? now) - now) / 1000));
    const resendIn = phase.step === 'mfa' ? Math.max(0, Math.ceil((phase.resendAvailableAt - now) / 1000)) : 0;

    // El reloj solo informa; el servidor aplica tanto el vencimiento como el bloqueo.
    useEffect(() => {
        const timer = window.setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);
            if (expiresAt !== null && currentTime >= expiresAt && !pending) {
                setPhase({ step: 'credentials' });
                setCredentialVersion((previous) => previous + 1);
                setCode('');
                setFieldErrors({});
                setNotice(accountCreated ? 'Tu cuenta ya está creada. Inicia sesión para completar la verificación.' : '');
                setFormError('El código venció. Ingresa tu correo y contraseña para recibir otro.');
            }
        }, 1000);
        return () => window.clearInterval(timer);
    }, [expiresAt, pending, accountCreated]);

    const resetErrors = () => {
        setFieldErrors({});
        setFormError('');
        setNotice('');
    };

    const returnToCredentials = (existingAccount = accountCreated) => {
        if (existingAccount) setAccountCreated(true);
        setPhase({ step: 'credentials' });
        setCredentialVersion((previous) => previous + 1);
        setCode('');
        resetErrors();
        if (existingAccount) setNotice('Tu cuenta ya está creada. Inicia sesión para completar la verificación.');
    };

    const restartRegistration = () => {
        setAccountCreated(false);
        setCredentials({ name: '', email: '', role: 'HUESPED' });
        returnToCredentials(false);
    };

    const acceptChallenge = (challenge: MfaChallenge) => {
        const currentTime = Date.now();
        setNow(currentTime);
        setPhase({ step: 'mfa', challenge, resendAvailableAt: currentTime + challenge.resend_after * 1000 });
        setCode('');
        resetErrors();
    };

    const showErrors = (error: unknown, operation: AuthOperation) => {
        if (!isAxiosError<ApiErrorBody>(error)) {
            setFormError('No fue posible completar la solicitud. Inténtalo de nuevo.');
            return;
        }
        const response = error.response;
        const body = response?.data;
        if (response?.status === 503 && body?.account_created) {
            returnToCredentials(true);
            setFormError(body.message || 'No pudimos enviar el código. Ingresa tus datos para volver a intentarlo.');
            return;
        }
        if (body?.code === 'mfa_expired' || body?.errors?.challenge_id) {
            returnToCredentials();
            setFormError(body.message || 'La verificación venció. Ingresa tus datos de nuevo para recibir otro código.');
            return;
        }
        if (response?.status === 429) {
            const currentTime = Date.now();
            const accountLocked = body?.code === 'auth_locked';
            const seconds = retryAfterSeconds(response.headers['retry-after'], body?.retry_after, currentTime, accountLocked ? 86400 : 60);
            setNow(currentTime);
            if (operation === 'resend' && !accountLocked) {
                setPhase((previous) => previous.step === 'mfa'
                    ? { ...previous, resendAvailableAt: currentTime + seconds * 1000 }
                    : previous);
                setFormError(body?.message || 'Espera antes de solicitar otro código.');
            } else {
                if (accountLocked) returnToCredentials();
                setLock({
                    until: currentTime + seconds * 1000,
                    message: body?.message || (accountLocked
                        ? 'El acceso está bloqueado durante 24 horas tras 10 intentos fallidos.'
                        : 'Has realizado demasiadas solicitudes. Espera antes de continuar.'),
                });
                setFormError('');
            }
            return;
        }
        if (response?.status === 419) {
            returnToCredentials();
            setFormError('La sesión del navegador venció. Recarga la página e inténtalo de nuevo.');
            return;
        }
        const errors: AuthFieldErrors = {};
        const other: string[] = [];
        for (const [field, messages] of Object.entries(body?.errors ?? {})) {
            if (authFields.includes(field as AuthField)) errors[field as AuthField] = messages[0];
            else other.push(...messages);
        }
        setFieldErrors(errors);
        setFormError(other.join(' ') || (Object.keys(errors).length === 0
            ? body?.message || 'No fue posible conectar con el servidor.'
            : ''));
    };

    const clearFieldError = (field: string) => {
        setFormError('');
        setNotice('');
        setFieldErrors((previous) => {
            if (!(field in previous)) return previous;
            const next = { ...previous };
            delete next[field as AuthField];
            return next;
        });
    };

    const handleChange = (event: FormEvent<HTMLFormElement>) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
        clearFieldError(target.name);
        if (target.name === 'role') {
            const role = target.value as UserRole;
            setCredentials((previous) => ({ ...previous, role }));
        } else if (target.name === 'name' || target.name === 'email') {
            const field = target.name;
            const value = target.value;
            setCredentials((previous) => ({ ...previous, [field]: value }));
        }
    };

    const changeCode = (value: string) => {
        setCode(value.replace(/\D/g, '').slice(0, 6));
        clearFieldError('code');
    };

    /** Atributos de accesibilidad que enlazan un campo con su mensaje de error. */
    const errorProps = (field: AuthField) => fieldErrors[field]
        ? { 'aria-invalid': true, 'aria-describedby': `auth-${field}-error` }
        : {};

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending || lockSeconds > 0) return;
        resetErrors();
        const data = new FormData(event.currentTarget);
        const email = String(data.get('email') ?? '').trim();
        const password = String(data.get('password') ?? '');

        if (effectiveRegisterMode) {
            const name = String(data.get('name') ?? '').trim();
            const role = data.get('role') as UserRole;
            setCredentials({ name, email, role });
            const confirmation = String(data.get('password_confirmation') ?? '');
            if (password !== confirmation) {
                setFieldErrors({ password_confirmation: 'Las contraseñas no coinciden.' });
                return;
            }
            register.mutate({
                name,
                email,
                password,
                password_confirmation: confirmation,
                role,
            }, {
                onSuccess: (response) => {
                    setAccountCreated(true);
                    acceptChallenge(response.data);
                },
                onError: (error) => showErrors(error, 'credentials'),
                onSettled: () => register.reset(),
            });
        } else {
            setCredentials((previous) => ({ ...previous, email }));
            login.mutate({ email, password }, {
                onSuccess: (response) => acceptChallenge(response.data),
                onError: (error) => showErrors(error, 'credentials'),
                onSettled: () => login.reset(),
            });
        }
    };

    const submitCode = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (phase.step !== 'mfa' || pending || lockSeconds > 0 || expiresIn <= 0) return;
        resetErrors();
        if (!/^\d{6}$/.test(code)) {
            setFieldErrors({ code: 'Ingresa el código de 6 dígitos que recibiste por correo.' });
            return;
        }
        verify.mutate({ challenge_id: phase.challenge.challenge_id, code }, {
            onSuccess: () => setCode(''),
            onError: (error) => {
                setCode('');
                showErrors(error, 'verify');
            },
            onSettled: () => verify.reset(),
        });
    };

    const resendCode = () => {
        if (phase.step !== 'mfa' || pending || lockSeconds > 0 || resendIn > 0 || expiresIn <= 0) return;
        resetErrors();
        resend.mutate(phase.challenge.challenge_id, {
            onSuccess: (response) => {
                acceptChallenge(response.data);
                setNotice('Te enviamos un código nuevo. Usa el último correo recibido.');
            },
            onError: (error) => showErrors(error, 'resend'),
            onSettled: () => resend.reset(),
        });
    };

    const cancelChallenge = () => {
        if (phase.step !== 'mfa' || pending) return;
        resetErrors();
        cancel.mutate(phase.challenge.challenge_id, {
            onSuccess: () => returnToCredentials(),
            onError: (error) => showErrors(error, 'cancel'),
            onSettled: () => cancel.reset(),
        });
    };

    return {
        loading,
        registerMode: effectiveRegisterMode,
        accountCreated,
        redirectTo: user ? dashboardPath(user, registerMode) : null,
        phase,
        credentials,
        credentialVersion,
        code,
        pending,
        verifying: verify.isPending,
        resending: resend.isPending,
        canceling: cancel.isPending,
        lockSeconds,
        lockMessage: lock?.message ?? '',
        expiresIn,
        resendIn,
        fieldErrors,
        formError,
        notice,
        submit,
        submitCode,
        resendCode,
        cancelChallenge,
        restartRegistration,
        changeCode,
        resetErrors,
        handleChange,
        errorProps,
    };
}
