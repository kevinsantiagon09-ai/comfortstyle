import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.api';
import type { AuthResponse, UserRole } from '../types/auth';
import { useAuth } from './useAuth';
import { sessionQueryKey } from './useSession';

export type AuthField = 'name' | 'email' | 'password' | 'password_confirmation' | 'role';
export type FieldErrors = Partial<Record<AuthField, string>>;

const authFields: AuthField[] = ['name', 'email', 'password', 'password_confirmation', 'role'];

export function useAuthForm(registerMode: boolean) {
    const { user, loading } = useAuth();
    const queryClient = useQueryClient();
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [formError, setFormError] = useState('');
    const updateSession = async (response: AuthResponse) => {
        await queryClient.cancelQueries({ queryKey: sessionQueryKey });
        queryClient.setQueryData(sessionQueryKey, response.data);
    };
    const showErrors = (error: unknown) => {
        if (!isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
            setFormError('No fue posible completar la solicitud.');
            return;
        }
        const response = error.response;
        if (response?.status === 429) {
            setFormError('Demasiados intentos. Espera un minuto e inténtalo de nuevo.');
            return;
        }
        const errors: FieldErrors = {};
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
    const login = useMutation({ mutationFn: authApi.login, onSuccess: updateSession, onError: showErrors });
    const register = useMutation({ mutationFn: authApi.register, onSuccess: updateSession, onError: showErrors });
    const pending = login.isPending || register.isPending;

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
            });
        } else {
            login.mutate({ email, password });
        }
    };

    return {
        loading,
        redirectTo: user
            ? user.roles.some((role) => role.name === 'ANFITRION') ? (registerMode ? '/host/setup' : '/host') : '/guest'
            : null,
        pending,
        fieldErrors,
        formError,
        submit,
        resetErrors,
        clearFieldError,
    };
}
