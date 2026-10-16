import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useNavbar } from '../../hooks/layout/useNavbar';
import { paths } from '../../routes/paths';
import NotificationBell from '../notifications/NotificationBell';
import RoleModeBadge from './RoleModeBadge';

export default function Navbar() {
    const { user, isAuthenticated, mode, initial, handleLogout, pending, error } = useNavbar();

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
                <Link to={paths.home} className="flex items-center gap-2">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-extrabold text-white shadow-sm">C</span>
                    <span className="hidden text-xl font-extrabold tracking-tight text-slate-900 sm:block">Comfort<span className="text-blue-700">Style</span></span>
                </Link>

                <div className="flex items-center gap-2 sm:gap-3">
                    {isAuthenticated && user ? (
                        <>
                            {mode && <RoleModeBadge mode={mode} />}
                            <NotificationBell />
                            <span title={user.name} className="hidden h-10 w-10 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white md:grid">{initial}</span>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={pending}
                                aria-label="Cerrar sesión"
                                title="Cerrar sesión"
                                className="grid h-10 w-10 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
                            >
                                <LogOut aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to={paths.login} className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                                Iniciar sesión
                            </Link>
                            <Link to={paths.register} className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800">
                                Crear cuenta
                            </Link>
                        </>
                    )}
                </div>
            </nav>
            {error && <p role="alert" className="mx-auto max-w-7xl px-4 pb-2 text-sm text-red-700">{error}</p>}
        </header>
    );
}
