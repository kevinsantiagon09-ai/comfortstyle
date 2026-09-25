import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

interface RoleRouteProps {
    allowedRole: UserRole;
}

export default function RoleRoute({
    allowedRole,
}: RoleRouteProps) {
    const { user } = useAuth();

    const hasRole = user?.roles.some(
        (role) => role.name === allowedRole
    );

    if (!hasRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}