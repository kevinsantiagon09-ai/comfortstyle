import { useMutation } from '@tanstack/react-query';
import * as authApi from '../../api/auth.api';

export function useCancelMfa() {
    return useMutation({ mutationFn: authApi.cancelMfa, gcTime: 0 });
}
