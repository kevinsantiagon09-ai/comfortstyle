import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import type { ApiErrorBody } from '../../types/api';
import type { AuthFieldErrors } from '../../types/auth';
import { readPasswordRecoveryLink } from '../../utils/passwordRecovery';
import { useResetPassword } from './useResetPassword';

export function useResetPasswordForm() {
    const location = useLocation();
    const navigate = useNavigate();
    const link = readPasswordRecoveryLink(location.search);
    const [email] = useState(() => link.email);
    const [invalidLink, setInvalidLink] = useState(false);
    const [success, setSuccess] = useState('');
    const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
    const [formError, setFormError] = useState('');
    const mutation = useResetPassword();

    const clearError = (event: FormEvent<HTMLFormElement>) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement)) return;
        const field = target.name;
        setFormError('');
        if (field !== 'password' && field !== 'password_confirmation') return;
        setFieldErrors((previous) => {
            const next = { ...previous };
            delete next[field];
            return next;
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!link.valid || invalidLink || mutation.isPending || success) return;
        const form = event.currentTarget;
        const data = new FormData(form);
        const password = String(data.get('password') ?? '');
        const confirmation = String(data.get('password_confirmation') ?? '');
        const errors: AuthFieldErrors = {};
        setFormError('');
        if (password.length < 8 || !/\p{L}/u.test(password) || !/\p{N}/u.test(password)) {
            errors.password = 'Usa al menos 8 caracteres, incluyendo letras y números.';
        }
        if (password !== confirmation) errors.password_confirmation = 'Las contraseñas no coinciden.';
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        mutation.mutate({ token: link.token, email: link.email, password, password_confirmation: confirmation }, {
            onSuccess: () => {
                setSuccess('Tu contraseña fue actualizada. Inicia sesión con tu nueva contraseña.');
                navigate(paths.resetPassword, { replace: true });
            },
            onError: (error) => {
                if (!isAxiosError<ApiErrorBody>(error)) {
                    setFormError('No fue posible conectar con el servidor. Inténtalo de nuevo.');
                    return;
                }
                const body = error.response?.data;
                if (body?.code === 'password_reset_invalid' || body?.errors?.token) {
                    setInvalidLink(true);
                    setFormError(body?.message || 'Este enlace venció o ya fue utilizado. Solicita uno nuevo.');
                    navigate(paths.resetPassword, { replace: true });
                    return;
                }
                const errors: AuthFieldErrors = {};
                if (body?.errors?.password?.[0]) errors.password = body.errors.password[0];
                if (body?.errors?.password_confirmation?.[0]) errors.password_confirmation = body.errors.password_confirmation[0];
                setFieldErrors(errors);
                setFormError(Object.keys(errors).length > 0 ? '' : body?.message || 'No fue posible cambiar tu contraseña. Inténtalo de nuevo.');
            },
            onSettled: () => {
                form.reset();
                mutation.reset();
            },
        });
    };

    return { email, invalidLink: !link.valid || invalidLink, success, fieldErrors, formError, pending: mutation.isPending, clearError, submit };
}
