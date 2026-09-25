import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';
import Navbar from './Navbar';

export default function AuthForm({ registerMode = false }: { registerMode?: boolean }) {
    const { login, register, user, loading } = useAuth();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    if (loading) return <p role="status">Cargando sesión...</p>;
    if (user) return <Navigate to={user.roles.some((role) => role.name === 'ARRENDADOR') ? '/host' : '/guest'} replace />;
    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const email = String(data.get('email') ?? '').trim();
        const password = String(data.get('password') ?? '');
        setPending(true);
        setError('');
        try {
            if (registerMode) {
                const confirmation = String(data.get('password_confirmation') ?? '');
                if (password !== confirmation) {
                    setError('Las contraseñas no coinciden.');
                    return;
                }
                await register({ name: String(data.get('name') ?? '').trim(), email, password,
                    password_confirmation: confirmation, role: data.get('role') as UserRole });
            } else {
                await login({ email, password });
            }
        } catch (error) {
            if (isAxiosError<{ message?: string; errors?: Record<string, string[]> }>(error)) {
                const messages = Object.values(error.response?.data.errors ?? {}).flat();
                setError(messages.join(' ') || error.response?.data.message || 'No fue posible conectar con el servidor.');
            } else {
                setError('No fue posible completar la solicitud.');
            }
        } finally { setPending(false); }
    };
    const inputClass = 'mt-1 w-full rounded-lg border border-slate-300 px-3 py-2';
    return <>
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
            <h1 className="mb-6 text-3xl font-bold">{registerMode ? 'Crear una cuenta' : 'Iniciar sesión'}</h1>
            <form onSubmit={(event) => void submit(event)} className="space-y-4">
                {registerMode && <label className="block">Nombre<input className={inputClass} name="name" autoComplete="name" required maxLength={255} /></label>}
                <label className="block">Correo electrónico<input className={inputClass} name="email" type="email" autoComplete="email" required /></label>
                <label className="block">Contraseña<input className={inputClass} name="password" type="password" autoComplete={registerMode ? 'new-password' : 'current-password'} required minLength={registerMode ? 8 : undefined} /></label>
                {registerMode && <>
                    <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
                    <label className="block">Confirmar contraseña<input className={inputClass} name="password_confirmation" type="password" autoComplete="new-password" required minLength={8} /></label>
                    <label className="block">Tipo de cuenta<select className={inputClass} name="role" defaultValue="ARRENDATARIO"><option value="ARRENDATARIO">Huésped</option><option value="ARRENDADOR">Anfitrión</option></select></label>
                </>}
                {error && <p role="alert" className="text-red-700">{error}</p>}
                <button disabled={pending} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{pending ? 'Procesando...' : registerMode ? 'Crear cuenta' : 'Entrar'}</button>
            </form>
            <Link className="mt-4 block text-blue-700" to={registerMode ? '/login' : '/register'}>{registerMode ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Link>
        </main>
    </>;
}
