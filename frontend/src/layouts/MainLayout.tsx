import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RealtimeNotifications from '../components/notifications/RealtimeNotifications';
import { useAuth } from '../hooks/auth/session/useAuth';

export default function MainLayout() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8">
                <Outlet />
            </main>

            {isAuthenticated && <RealtimeNotifications />}
        </>
    );
}
