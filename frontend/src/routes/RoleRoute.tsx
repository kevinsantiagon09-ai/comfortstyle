import { Navigate, Outlet } from 'react-router-dom';
import { useRoleAccess } from '../hooks/auth/useRoleAccess';
import type { RoleRouteProps } from '../types/auth';
import { paths } from './paths';

export default function RoleRoute({
    allowedRole,
}: RoleRouteProps) {
    const hasRole = useRoleAccess(allowedRole);

    if (!hasRole) {
        return <Navigate to={paths.home} replace />;
    }

    return <Outlet />;
}
