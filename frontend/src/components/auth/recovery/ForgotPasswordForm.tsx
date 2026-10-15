import { Link } from 'react-router-dom';
import { useForgotPasswordForm } from '../../../hooks/auth/recovery/useForgotPasswordForm';
import AuthCountdown from '../shared/AuthCountdown';
import AuthFieldError from '../shared/AuthFieldError';

export default function ForgotPasswordForm() {
    const recovery = useForgotPasswordForm();

    return <>
        <h1 className="mb-6 text-3xl font-bold">Olvidé mi contraseña</h1>
        <p className="mb-6 text-sm text-slate-600">Ingresa el correo de tu cuenta para recibir un enlace y crear una nueva contraseña.</p>
        <form onSubmit={recovery.submit} className="space-y-4" aria-busy={recovery.pending}>
            <div>
                <label htmlFor="recovery-email" className="block">Correo electrónico</label>
                <input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={255}
                    {...recovery.emailInputProps} />
                <AuthFieldError field="email" message={recovery.emailError} />
            </div>
            {recovery.formError && <p role="alert" className="text-red-700">{recovery.formError}</p>}
            {recovery.notice && <p role="status" className="text-green-800">{recovery.notice}</p>}
            <button type="submit" disabled={recovery.submitDisabled}
                className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">
                {recovery.submitLabel}
            </button>
            {recovery.showCooldown && <p className="text-sm text-slate-600">Puedes solicitar otro enlace en <AuthCountdown seconds={recovery.resendIn} />.</p>}
        </form>
        <Link className="mt-4 block text-blue-700" to={recovery.loginPath}>Volver a iniciar sesión</Link>
    </>;
}
