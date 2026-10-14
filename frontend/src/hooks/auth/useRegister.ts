import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';

export function useRegister() {
    return useMutation({
        mutationFn: authApi.register,
        gcTime: 0,
    });
}
