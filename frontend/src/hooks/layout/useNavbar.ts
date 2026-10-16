import { useAuth } from '../auth/session/useAuth';
import { useLogout } from '../auth/session/useLogout';
import { useRoleMode } from './useRoleMode';

export function useNavbar() {
    const { user, isAuthenticated } = useAuth();
    const { mode } = useRoleMode();
    const logout = useLogout();

    const handleLogout = () => {
        if (!logout.isPending) logout.mutate();
    };

    return {
        user,
        isAuthenticated,
        mode,
        initial: user?.name.trim().charAt(0).toUpperCase() ?? '',
        handleLogout,
        pending: logout.isPending,
        error: logout.isError ? 'No fue posible cerrar sesión. Inténtalo de nuevo.' : null,
    };
}
