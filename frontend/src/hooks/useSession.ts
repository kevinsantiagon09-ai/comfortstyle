import { isAxiosError } from 'axios';
import { useQuery } from '@tanstack/react-query';
import * as authApi from '../api/auth.api';
import type { AuthUser } from '../types/auth';

export const sessionQueryKey = ['auth', 'me'] as const;

export function useSession() {
    const session = useQuery({
        queryKey: sessionQueryKey,
        queryFn: async ({ signal }): Promise<AuthUser | null> => {
            try {
                return await authApi.me(signal);
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 401) {
                    return null;
                }
                throw error;
            }
        },
        staleTime: Infinity,
        retry: false,
        refetchOnWindowFocus: false,
    });
    const user = session.data ?? null;

    return {
        user,
        loading: session.isPending,
        isAuthenticated: user !== null,
    };
}
