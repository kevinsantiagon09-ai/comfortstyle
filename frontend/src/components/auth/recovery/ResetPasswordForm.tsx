import { Link } from 'react-router-dom';
import { useResetPasswordForm } from '../../../hooks/auth/recovery/useResetPasswordForm';
import PasswordField from '../../ui/PasswordField';

export default function ResetPasswordForm() {
    const recovery = useResetPasswordForm();

    if (recovery.success) return <>
        <h1 className="mb-6 text-3xl font-bold">Contraseña actualizada</h1>
        <p role="status" className="mb-6 text-green-800">{recovery.success}</p>
        <Link className="block rounded-lg bg-blue-700 px-4 py-2 text-center text-white" to={recovery.loginPath}>Iniciar sesión</Link>
    </>;

    if (recovery.invalidLink) return <>
        <h1 className="mb-6 text-3xl font-bold">Enlace inválido</h1>
        <p role="alert" className="mb-6 text-red-700">{recovery.invalidLinkMessage}</p>
        <Link className="block rounded-lg bg-blue-700 px-4 py-2 text-center text-white" to={recovery.recoveryPath}>Solicitar un nuevo enlace</Link>
        <Link className="mt-4 block text-blue-700" to={recovery.loginPath}>Volver a iniciar sesión</Link>
    </>;

    return <>
        <h1 className="mb-6 text-3xl font-bold">Cambiar contraseña</h1>
        <p className="mb-6 text-sm text-slate-600">Crea una nueva contraseña para tu cuenta. Después, inicia sesión y confirma tu identidad con el código enviado a tu correo.</p>
        <form onSubmit={recovery.submit} onChange={recovery.clearError} className="space-y-4" aria-busy={recovery.pending}>
            <PasswordField label="Nueva contraseña" name="password" autoComplete="new-password" minLength={8} error={recovery.fieldErrors.password} />
            <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
            <PasswordField label="Confirmar contraseña" name="password_confirmation" autoComplete="new-password" minLength={8} error={recovery.fieldErrors.password_confirmation} />
            {recovery.formError && <p role="alert" className="text-red-700">{recovery.formError}</p>}
            <button type="submit" disabled={recovery.submitDisabled} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{recovery.submitLabel}</button>
        </form>
        <Link className="mt-4 block text-blue-700" to={recovery.recoveryPath}>Solicitar un nuevo enlace</Link>
        <Link className="mt-4 block text-blue-700" to={recovery.loginPath}>Volver a iniciar sesión</Link>
    </>;
}
