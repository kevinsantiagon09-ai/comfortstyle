import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';
import { useSetSession } from './useSetSession';

export function useVerifyMfa() {
    const setSession = useSetSession();

    return useMutation({
        mutationFn: authApi.verifyMfa,
        onSuccess: (response) => setSession(response.data),
        gcTime: 0,
    });
}
