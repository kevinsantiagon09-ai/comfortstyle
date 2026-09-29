import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/auth/useAuth';
import { paths } from './paths';

export default function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) return <p role="status">Cargando sesión...</p>;

    if (!isAuthenticated) {
        return <Navigate to={paths.login} replace />;
    }

    return <Outlet />;
}
