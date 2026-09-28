import { Link, Navigate } from 'react-router-dom';
import { useAuthForm } from '../hooks/useAuthForm';
import Navbar from './Navbar';
import PasswordField from './PasswordField';

export default function AuthForm({ registerMode = false }: { registerMode?: boolean }) {
    const { loading, redirectTo, pending, error, submit, resetErrors } = useAuthForm(registerMode);
    if (loading) return <p role="status">Cargando sesión...</p>;
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2';
    return <>
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
            <h1 className="mb-6 text-3xl font-bold">{registerMode ? 'Crear una cuenta' : 'Iniciar sesión'}</h1>
            <form onSubmit={submit} onChange={resetErrors} className="space-y-4">
                {registerMode && <label className="block">Nombre<input className={inputClass} name="name" autoComplete="name" required maxLength={255} /></label>}
                <label className="block">Correo electrónico<input className={inputClass} name="email" type="email" autoComplete="email" required /></label>
                <PasswordField label="Contraseña" name="password" autoComplete={registerMode ? 'new-password' : 'current-password'} minLength={registerMode ? 8 : undefined} />
                {registerMode && <>
                    <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
                    <PasswordField label="Confirmar contraseña" name="password_confirmation" autoComplete="new-password" minLength={8} />
                    <label className="block">Tipo de cuenta<select className={inputClass} name="role" defaultValue="HUESPED"><option value="HUESPED">Huésped</option><option value="ANFITRION">Anfitrión</option></select></label>
                </>}
                {error && <p role="alert" className="text-red-700">{error}</p>}
                <button disabled={pending} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{pending ? 'Procesando...' : registerMode ? 'Crear cuenta' : 'Entrar'}</button>
            </form>
            <Link onClick={resetErrors} className="mt-4 block text-blue-700" to={registerMode ? '/login' : '/register'}>{registerMode ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Link>
        </main>
    </>;
}
