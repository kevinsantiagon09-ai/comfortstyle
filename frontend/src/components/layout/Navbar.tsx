import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useNavbar } from '../../hooks/layout/useNavbar';
import { paths } from '../../routes/paths';

export default function Navbar() {
    const { user, isAuthenticated, handleLogout, pending, error } = useNavbar();

    return (
        <header className="border-b border-slate-200 bg-white">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
                <Link
                    to={paths.home}
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
                                onClick={handleLogout}
                                disabled={pending}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                            >
                                <LogOut aria-hidden="true" className="h-4 w-4" />
                                {pending ? 'Cerrando sesión...' : 'Cerrar sesión'}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to={paths.login}>
                                Iniciar sesión
                            </Link>

                            <Link
                                to={paths.register}
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
