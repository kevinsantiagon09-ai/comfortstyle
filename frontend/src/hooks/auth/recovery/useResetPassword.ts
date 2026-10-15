import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../../api/auth/auth.api';
import { useSetSession } from '../session/useSetSession';

export function useResetPassword() {
    const setSession = useSetSession();
    return useMutation({
        mutationFn: authApi.resetPassword,
        gcTime: 0,
        // El servidor revoca las sesiones. Cancela /me pendiente y conserva el estado de invitado.
        onSuccess: () => setSession(null),
    });
}
