import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../../api/auth/auth.api';
import { useSetSession } from '../session/useSetSession';

export function useVerifyMfa() {
    const setSession = useSetSession();

    return useMutation({
        mutationFn: authApi.verifyMfa,
        onSuccess: (response) => setSession(response.data),
        gcTime: 0,
    });
}
