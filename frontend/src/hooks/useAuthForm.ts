import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.api';
import type { AuthResponse, UserRole } from '../types/auth';
import { useAuth } from './useAuth';
import { sessionQueryKey } from './useSession';

export function useAuthForm(registerMode: boolean) {
    const { user, loading } = useAuth();
    const queryClient = useQueryClient();
    const [validationError, setValidationError] = useState('');
    const updateSession = async (response: AuthResponse) => {
        await queryClient.cancelQueries({ queryKey: sessionQueryKey });
        queryClient.setQueryData(sessionQueryKey, response.data);
    };
    const login = useMutation({ mutationFn: authApi.login, onSuccess: updateSession });
    const register = useMutation({ mutationFn: authApi.register, onSuccess: updateSession });
    const mutation = registerMode ? register : login;
    const pending = login.isPending || register.isPending;
    let error = validationError;

    if (!error && mutation.error) {
        if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(mutation.error)) {
            const response = mutation.error.response?.data;
            error = Object.values(response?.errors ?? {}).flat().join(' ')
                || response?.message || 'No fue posible conectar con el servidor.';
        } else {
            error = 'No fue posible completar la solicitud.';
        }
    }

    const resetErrors = () => {
        setValidationError('');
        if (!pending) {
            login.reset();
            register.reset();
        }
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
                setValidationError('Las contraseñas no coinciden.');
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
            ? user.roles.some((role) => role.name === 'ANFITRION') ? '/host' : '/guest'
            : null,
        pending,
        error,
        submit,
        resetErrors,
    };
}
