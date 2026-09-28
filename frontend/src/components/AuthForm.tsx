import { Link, Navigate } from 'react-router-dom';
import { useAuthForm, type AuthField } from '../hooks/useAuthForm';
import Navbar from './Navbar';
import PasswordField from './PasswordField';

function FieldError({ field, message }: { field: AuthField; message?: string }) {
    return message ? <p id={`auth-${field}-error`} className="mt-1 text-sm text-red-700">{message}</p> : null;
}

export default function AuthForm({ registerMode = false }: { registerMode?: boolean }) {
    const { loading, redirectTo, pending, fieldErrors, formError, submit, resetErrors, clearFieldError } = useAuthForm(registerMode);
    if (loading) return <p role="status">Cargando sesión...</p>;
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    const inputClass = (field: AuthField) => `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[field] ? 'border-red-600' : 'border-slate-300'}`;
    const errorProps = (field: AuthField) => fieldErrors[field]
        ? { 'aria-invalid': true, 'aria-describedby': `auth-${field}-error` }
        : {};
    return <>
        <Navbar />
        <main className="mx-auto max-w-md px-4 py-12">
            <h1 className="mb-6 text-3xl font-bold">{registerMode ? 'Crear una cuenta' : 'Iniciar sesión'}</h1>
            <form onSubmit={submit} onChange={(event) => { if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) clearFieldError(event.target.name); }} className="space-y-4">
                {registerMode && <div>
                    <label className="block">Nombre<input className={inputClass('name')} name="name" autoComplete="name" required maxLength={255} {...errorProps('name')} /></label>
                    <FieldError field="name" message={fieldErrors.name} />
                </div>}
                <div>
                    <label className="block">Correo electrónico<input className={inputClass('email')} name="email" type="email" autoComplete="email" required {...errorProps('email')} /></label>
                    <FieldError field="email" message={fieldErrors.email} />
                </div>
                <PasswordField label="Contraseña" name="password" autoComplete={registerMode ? 'new-password' : 'current-password'} minLength={registerMode ? 8 : undefined} error={fieldErrors.password} />
                {registerMode && <>
                    <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
                    <PasswordField label="Confirmar contraseña" name="password_confirmation" autoComplete="new-password" minLength={8} error={fieldErrors.password_confirmation} />
                    <div>
                        <label className="block">Tipo de cuenta<select className={inputClass('role')} name="role" defaultValue="HUESPED" {...errorProps('role')}><option value="HUESPED">Huésped</option><option value="ANFITRION">Anfitrión</option></select></label>
                        <FieldError field="role" message={fieldErrors.role} />
                    </div>
                </>}
                {formError && <p role="alert" className="text-red-700">{formError}</p>}
                <button disabled={pending} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{pending ? 'Procesando...' : registerMode ? 'Crear cuenta' : 'Entrar'}</button>
            </form>
            <Link onClick={resetErrors} className="mt-4 block text-blue-700" to={registerMode ? '/login' : '/register'}>{registerMode ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Link>
        </main>
    </>;
}
