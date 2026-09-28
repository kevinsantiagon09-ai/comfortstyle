import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth.api';
import { clearPropertySetup } from '../features/properties/store/usePropertySetupStore';
import { useAuth } from './useAuth';
import { sessionQueryKey } from './useSession';

export function useNavbar() {
    const { user, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const logout = useMutation({
        mutationFn: authApi.logout,
        onSuccess: async () => {
            await queryClient.cancelQueries();
            queryClient.removeQueries({
                predicate: (query) => query.queryKey[0] !== 'auth',
            });
            queryClient.setQueryData(sessionQueryKey, null);
            clearPropertySetup();
        },
    });

    const handleLogout = () => {
        if (!logout.isPending) logout.mutate();
    };

    return {
        user,
        isAuthenticated,
        handleLogout,
        pending: logout.isPending,
        error: logout.isError ? 'No fue posible cerrar sesión. Inténtalo de nuevo.' : null,
    };
}
