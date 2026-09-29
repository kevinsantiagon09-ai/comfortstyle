import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';
import { useSetSession } from './useSetSession';

export function useRegister() {
    const setSession = useSetSession();

    return useMutation({
        mutationFn: authApi.register,
        onSuccess: (response) => setSession(response.data),
    });
}
