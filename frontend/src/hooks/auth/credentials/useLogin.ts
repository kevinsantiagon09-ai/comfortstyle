import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../../api/auth/auth.api';

export function useLogin() {
    return useMutation({
        mutationFn: authApi.login,
        gcTime: 0,
    });
}
