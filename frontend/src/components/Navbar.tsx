import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
    const {
        user,
        isAuthenticated,
        logout,
    } = useAuth();

    const [error, setError] = useState('');
    const handleLogout = async () => {
        setError('');
        try { await logout(); } catch { setError('No fue posible cerrar sesión. Inténtalo de nuevo.'); }
    };

    return (
        <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <Link
                    to="/"
                    className="text-2xl font-bold text-blue-700"
                >
                    ComfortStyle
                </Link>

                <div className="flex items-center gap-3">
                    {isAuthenticated && user ? (
                        <>
                            <span className="text-sm text-slate-600">
                                Hola, {user.name}
                            </span>

                            <button
                                type="button"
                                onClick={() => void handleLogout()}
                                className="rounded-full border px-4 py-2"
                            >
                                Cerrar sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                Iniciar sesión
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-full bg-blue-700 px-4 py-2 text-white"
                            >
                                Crear cuenta
                            </Link>
                        </>
                    )}
                    {error && <p role="alert">{error}</p>}
                </div>
            </nav>
        </header>
    );
}