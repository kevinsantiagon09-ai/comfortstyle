import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';
import { useSetSession } from './useSetSession';

export function useLogin() {
    const setSession = useSetSession();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: (response) => setSession(response.data),
    });
}
