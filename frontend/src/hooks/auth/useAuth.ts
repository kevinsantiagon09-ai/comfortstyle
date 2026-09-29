import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import * as authApi from '../../api/auth.api';
import { queryKeys } from '../../api/queryKeys';
import type { AuthSession, AuthUser } from '../../types/auth';

/** Sesión actual. Vive en la caché de React Query, así que cualquier componente puede leerla sin un Provider. */
export function useAuth(): AuthSession {
    const session = useQuery({
        queryKey: queryKeys.session,
        queryFn: async ({ signal }): Promise<AuthUser | null> => {
            try {
                return await authApi.me(signal);
            } catch (error) {
                if (isAxiosError(error) && error.response?.status === 401) return null;
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
