import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import GuestDashboard from '../pages/guest/GuestDashboard';
import HostDashboard from '../pages/host/HostDashboard';
import PropertyEditPage from '../pages/host/PropertyEditPage';
import PropertySetupPage from '../pages/host/PropertySetupPage';
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import NotFoundPage from '../pages/public/NotFoundPage';
import RegisterPage from '../pages/public/RegisterPage';
import { paths } from './paths';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

export const router = createBrowserRouter([
    // Públicas
    {
        element: <MainLayout />,
        children: [
            { path: paths.home, element: <HomePage /> },
        ],
    },
    {
        element: <AuthLayout />,
        children: [
            { path: paths.login, element: <LoginPage /> },
            { path: paths.register, element: <RegisterPage /> },
        ],
    },

    // Requieren sesión
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <RoleRoute allowedRole="HUESPED" />,
                children: [{
                    element: <MainLayout />,
                    children: [
                        { path: paths.guest, element: <GuestDashboard /> },
                    ],
                }],
            },
            {
                element: <RoleRoute allowedRole="ANFITRION" />,
                children: [{
                    element: <MainLayout />,
                    children: [
                        { path: paths.host, element: <HostDashboard /> },
                        { path: paths.hostSetup, element: <PropertySetupPage /> },
                        { path: paths.hostPropertyEdit, element: <PropertyEditPage /> },
                    ],
                }],
            },
        ],
    },

    { path: '*', element: <NotFoundPage /> },
]);
