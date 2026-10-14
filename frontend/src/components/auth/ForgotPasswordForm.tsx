import { Link } from 'react-router-dom';
import { useForgotPasswordForm } from '../../hooks/auth/useForgotPasswordForm';
import { paths } from '../../routes/paths';
import AuthCountdown from './AuthCountdown';
import AuthFieldError from './AuthFieldError';

export default function ForgotPasswordForm() {
    const recovery = useForgotPasswordForm();

    return <>
        <h1 className="mb-6 text-3xl font-bold">Olvidé mi contraseña</h1>
        <p className="mb-6 text-sm text-slate-600">Ingresa el correo de tu cuenta para recibir un enlace y crear una nueva contraseña.</p>
        <form onSubmit={recovery.submit} className="space-y-4" aria-busy={recovery.pending}>
            <div>
                <label htmlFor="recovery-email" className="block">Correo electrónico</label>
                <input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={255}
                    value={recovery.email} onChange={(event) => recovery.changeEmail(event.target.value)}
                    className={`mt-1 w-full rounded-lg border px-3 py-2 ${recovery.emailError ? 'border-red-600' : 'border-slate-300'}`}
                    aria-invalid={recovery.emailError ? true : undefined} aria-describedby={recovery.emailError ? 'auth-email-error' : undefined} />
                <AuthFieldError field="email" message={recovery.emailError} />
            </div>
            {recovery.formError && <p role="alert" className="text-red-700">{recovery.formError}</p>}
            {recovery.notice && <p role="status" className="text-green-800">{recovery.notice}</p>}
            <button type="submit" disabled={recovery.pending || recovery.resendIn > 0}
                className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">
                {recovery.pending ? 'Enviando...' : recovery.notice ? 'Solicitar otro enlace' : 'Enviar enlace'}
            </button>
            {recovery.resendIn > 0 && <p className="text-sm text-slate-600">Puedes solicitar otro enlace en <AuthCountdown seconds={recovery.resendIn} />.</p>}
        </form>
        <Link className="mt-4 block text-blue-700" to={paths.login}>Volver a iniciar sesión</Link>
    </>;
}
