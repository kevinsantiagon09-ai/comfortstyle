import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../../api/auth/auth.api';

export function useResendMfa() {
    return useMutation({ mutationFn: authApi.resendMfa, gcTime: 0 });
}
