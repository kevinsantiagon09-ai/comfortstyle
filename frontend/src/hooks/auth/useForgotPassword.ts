import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';

export function useForgotPassword() {
    return useMutation({ mutationFn: authApi.forgotPassword, gcTime: 0 });
}
