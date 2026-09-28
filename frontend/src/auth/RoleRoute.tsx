import { Navigate, Outlet } from 'react-router-dom';
import { useRoleAccess } from '../hooks/useRoleAccess';
import type { UserRole } from '../types/auth';

interface RoleRouteProps {
    allowedRole: UserRole;
}

export default function RoleRoute({
    allowedRole,
}: RoleRouteProps) {
    const hasRole = useRoleAccess(allowedRole);

    if (!hasRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}