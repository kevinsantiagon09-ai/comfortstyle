import { Link } from 'react-router-dom';
import { useResetPasswordForm } from '../../hooks/auth/useResetPasswordForm';
import { forgotPasswordPath, paths } from '../../routes/paths';
import PasswordField from '../ui/PasswordField';

export default function ResetPasswordForm() {
    const recovery = useResetPasswordForm();

    if (recovery.success) return <>
        <h1 className="mb-6 text-3xl font-bold">Contraseña actualizada</h1>
        <p role="status" className="mb-6 text-green-800">{recovery.success}</p>
        <Link className="block rounded-lg bg-blue-700 px-4 py-2 text-center text-white" to={paths.login}>Iniciar sesión</Link>
    </>;

    if (recovery.invalidLink) return <>
        <h1 className="mb-6 text-3xl font-bold">Enlace inválido</h1>
        <p role="alert" className="mb-6 text-red-700">{recovery.formError || 'El enlace no es válido. Solicita uno nuevo para cambiar tu contraseña.'}</p>
        <Link className="block rounded-lg bg-blue-700 px-4 py-2 text-center text-white" to={forgotPasswordPath(recovery.email)}>Solicitar un nuevo enlace</Link>
        <Link className="mt-4 block text-blue-700" to={paths.login}>Volver a iniciar sesión</Link>
    </>;

    return <>
        <h1 className="mb-6 text-3xl font-bold">Cambiar contraseña</h1>
        <p className="mb-6 text-sm text-slate-600">Crea una nueva contraseña para tu cuenta. Después, inicia sesión y confirma tu identidad con el código enviado a tu correo.</p>
        <form onSubmit={recovery.submit} onChange={recovery.clearError} className="space-y-4" aria-busy={recovery.pending}>
            <PasswordField label="Nueva contraseña" name="password" autoComplete="new-password" minLength={8} error={recovery.fieldErrors.password} />
            <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
            <PasswordField label="Confirmar contraseña" name="password_confirmation" autoComplete="new-password" minLength={8} error={recovery.fieldErrors.password_confirmation} />
            {recovery.formError && <p role="alert" className="text-red-700">{recovery.formError}</p>}
            <button type="submit" disabled={recovery.pending} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{recovery.pending ? 'Actualizando...' : 'Guardar nueva contraseña'}</button>
        </form>
        <Link className="mt-4 block text-blue-700" to={forgotPasswordPath(recovery.email)}>Solicitar un nuevo enlace</Link>
        <Link className="mt-4 block text-blue-700" to={paths.login}>Volver a iniciar sesión</Link>
    </>;
}
