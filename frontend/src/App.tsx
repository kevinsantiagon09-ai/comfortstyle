import {
    BrowserRouter,
    Route,
    Routes,
} from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import GuestLayout from './layouts/GuestLayout';
import HostLayout from './layouts/HostLayout';
import GuestDashboard from './pages/guest/GuestDashboard';
import HostDashboard from './pages/host/HostDashboard';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPages';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/register"
                    element={<RegisterPage />}
                />

                <Route element={<ProtectedRoute />}>
                    <Route
                        element={
                            <RoleRoute allowedRole="ARRENDATARIO" />
                        }
                    >
                        <Route element={<GuestLayout />}>
                            <Route
                                path="/guest"
                                element={<GuestDashboard />}
                            />
                        </Route>
                    </Route>

                    <Route
                        element={
                            <RoleRoute allowedRole="ARRENDADOR" />
                        }
                    >
                        <Route element={<HostLayout />}>
                            <Route
                                path="/host"
                                element={<HostDashboard />}
                            />
                        </Route>
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<h1>Página no encontrada</h1>}
                />
            </Routes>
        </BrowserRouter>
    );
}