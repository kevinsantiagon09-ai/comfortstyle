import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';
import { paths } from '../../../routes/paths';
import type { ApiErrorBody } from '../../../types/api';
import { isRecoveryEmail, passwordRecoveryNotice, recoveryRetryAfter } from '../../../utils/passwordRecovery';
import { useForgotPassword } from './useForgotPassword';

export function useForgotPasswordForm() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(() => searchParams.get('email')?.trim() ?? '');
    const [emailError, setEmailError] = useState('');
    const [formError, setFormError] = useState('');
    const [notice, setNotice] = useState('');
    const [resendAvailableAt, setResendAvailableAt] = useState(0);
    const [now, setNow] = useState(() => Date.now());
    const mutation = useForgotPassword();
    const resendIn = Math.max(0, Math.ceil((resendAvailableAt - now) / 1000));

    useEffect(() => {
        if (!resendAvailableAt) return;
        const timer = window.setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);
            if (currentTime >= resendAvailableAt) window.clearInterval(timer);
        }, 1000);
        return () => window.clearInterval(timer);
    }, [resendAvailableAt]);

    const handleEmailChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setEmailError('');
        setFormError('');
        setNotice('');
    };

    const startCooldown = (seconds: number) => {
        const currentTime = Date.now();
        setNow(currentTime);
        setResendAvailableAt(currentTime + seconds * 1000);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (mutation.isPending || resendIn > 0) return;
        const address = email.trim();
        setEmailError('');
        setFormError('');
        setNotice('');
        if (!isRecoveryEmail(address)) {
            setEmailError('Ingresa un correo electrónico válido.');
            return;
        }
        setEmail(address);
        mutation.mutate({ email: address }, {
            onSuccess: (response) => {
                setNotice(passwordRecoveryNotice);
                const seconds = Number.isFinite(response.resend_after) ? Math.max(1, response.resend_after) : 60;
                startCooldown(seconds);
            },
            onError: (error) => {
                if (!isAxiosError<ApiErrorBody>(error)) {
                    setFormError('No fue posible conectar con el servidor. Inténtalo de nuevo.');
                    return;
                }
                const response = error.response;
                const body = response?.data;
                if (response?.status === 429) {
                    startCooldown(recoveryRetryAfter(response.headers['retry-after'], body?.retry_after));
                    setFormError(body?.message || 'Espera antes de solicitar otro enlace.');
                    return;
                }
                if (body?.errors?.email?.[0]) setEmailError(body.errors.email[0]);
                else setFormError(body?.message || 'No pudimos enviar el enlace. Inténtalo de nuevo en unos momentos.');
            },
            onSettled: () => mutation.reset(),
        });
    };

    return {
        email,
        emailError,
        formError,
        notice,
        resendIn,
        pending: mutation.isPending,
        submitDisabled: mutation.isPending || resendIn > 0,
        showCooldown: resendIn > 0,
        submitLabel: mutation.isPending ? 'Enviando...' : notice ? 'Solicitar otro enlace' : 'Enviar enlace',
        loginPath: paths.login,
        emailInputProps: {
            value: email,
            onChange: handleEmailChange,
            className: `mt-1 w-full rounded-lg border px-3 py-2 ${emailError ? 'border-red-600' : 'border-slate-300'}`,
            'aria-invalid': emailError ? true : undefined,
            'aria-describedby': emailError ? 'auth-email-error' : undefined,
        },
        handleEmailChange,
        submit,
    };
}
