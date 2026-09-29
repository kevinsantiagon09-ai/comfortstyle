import { useAuth } from '../auth/useAuth';
import { useLogout } from '../auth/useLogout';

export function useNavbar() {
    const { user, isAuthenticated } = useAuth();
    const logout = useLogout();

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
