import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '../../types/api';
import type { AuthField, AuthFieldErrors, UserRole } from '../../types/auth';
import { dashboardPath } from '../../utils/auth';
import { useAuth } from './useAuth';
import { useLogin } from './useLogin';
import { useRegister } from './useRegister';

const authFields: AuthField[] = ['name', 'email', 'password', 'password_confirmation', 'role'];

export function useAuthForm(registerMode: boolean) {
    const { user, loading } = useAuth();
    const login = useLogin();
    const register = useRegister();
    const [fieldErrors, setFieldErrors] = useState<AuthFieldErrors>({});
    const [formError, setFormError] = useState('');
    const pending = login.isPending || register.isPending;

    const showErrors = (error: unknown) => {
        if (!isAxiosError<ApiErrorBody>(error)) {
            setFormError('No fue posible completar la solicitud.');
            return;
        }
        const response = error.response;
        if (response?.status === 429) {
            setFormError('Demasiados intentos. Espera un minuto e inténtalo de nuevo.');
            return;
        }
        const errors: AuthFieldErrors = {};
        const other: string[] = [];
        for (const [field, messages] of Object.entries(response?.data.errors ?? {})) {
            if (authFields.includes(field as AuthField)) errors[field as AuthField] = messages[0];
            else other.push(...messages);
        }
        setFieldErrors(errors);
        setFormError(other.join(' ') || (Object.keys(errors).length === 0
            ? response?.data.message || 'No fue posible conectar con el servidor.'
            : ''));
    };

    const resetErrors = () => {
        setFieldErrors({});
        setFormError('');
    };
    const clearFieldError = (field: string) => {
        setFormError('');
        setFieldErrors((previous) => {
            if (!(field in previous)) return previous;
            const next = { ...previous };
            delete next[field as AuthField];
            return next;
        });
    };
    const handleChange = (event: FormEvent<HTMLFormElement>) => {
        const target = event.target;
        if (target instanceof HTMLInputElement || target instanceof HTMLSelectElement) clearFieldError(target.name);
    };
    /** Atributos de accesibilidad que enlazan un campo con su mensaje de error. */
    const errorProps = (field: AuthField) => fieldErrors[field]
        ? { 'aria-invalid': true, 'aria-describedby': `auth-${field}-error` }
        : {};

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending) return;
        resetErrors();
        const data = new FormData(event.currentTarget);
        const email = String(data.get('email') ?? '').trim();
        const password = String(data.get('password') ?? '');

        if (registerMode) {
            const confirmation = String(data.get('password_confirmation') ?? '');
            if (password !== confirmation) {
                setFieldErrors({ password_confirmation: 'Las contraseñas no coinciden.' });
                return;
            }
            register.mutate({
                name: String(data.get('name') ?? '').trim(),
                email,
                password,
                password_confirmation: confirmation,
                role: data.get('role') as UserRole,
            }, { onError: showErrors });
        } else {
            login.mutate({ email, password }, { onError: showErrors });
        }
    };

    return {
        loading,
        redirectTo: user ? dashboardPath(user, registerMode) : null,
        pending,
        fieldErrors,
        formError,
        submit,
        resetErrors,
        handleChange,
        errorProps,
    };
}
