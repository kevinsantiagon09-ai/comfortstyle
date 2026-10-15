import { Link, Navigate } from 'react-router-dom';
import { useAuthForm } from '../../../hooks/auth/credentials/useAuthForm';
import type { AuthFormProps } from '../../../types/auth';
import PasswordField from '../../ui/PasswordField';
import AuthFieldError from '../shared/AuthFieldError';
import AuthLockNotice from '../shared/AuthLockNotice';
import MfaChallengeForm from '../mfa/MfaChallengeForm';

export default function AuthForm({ registerMode: initialRegisterMode = false }: AuthFormProps) {
    const auth = useAuthForm(initialRegisterMode);
    const { loading, redirectTo, registerMode, credentials, credentialVersion, pending, lockSeconds, lockMessage, fieldErrors, formError, submit, handleChange, errorProps, inputClass } = auth;
    if (loading) return <p role="status">Cargando sesión...</p>;
    if (redirectTo) return <Navigate to={redirectTo} replace />;

    return <>
        <h1 className="mb-6 text-3xl font-bold">{auth.title}</h1>
        {auth.showLock && <div className="mb-4"><AuthLockNotice seconds={lockSeconds} message={lockMessage} /></div>}
        {auth.mfaForm ? <MfaChallengeForm {...auth.mfaForm} /> : <>
        <p className="mb-6 text-sm text-slate-600">{auth.description}</p>
        {auth.notice && <p role="status" className="mb-4 text-sm text-green-800">{auth.notice}</p>}
        <form key={credentialVersion} onSubmit={submit} onChange={handleChange} className="space-y-4" aria-busy={pending}>
            {registerMode && <div>
                <label className="block">Nombre<input className={inputClass('name')} name="name" defaultValue={credentials.name} autoComplete="name" required maxLength={255} {...errorProps('name')} /></label>
                <AuthFieldError field="name" message={fieldErrors.name} />
            </div>}
            <div>
                <label className="block">Correo electrónico<input className={inputClass('email')} name="email" defaultValue={credentials.email} type="email" autoComplete="email" required {...errorProps('email')} /></label>
                <AuthFieldError field="email" message={fieldErrors.email} />
            </div>
            <PasswordField label="Contraseña" name="password" autoComplete={auth.passwordAutoComplete} minLength={auth.passwordMinLength} error={fieldErrors.password} />
            {registerMode && <>
                <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
                <PasswordField label="Confirmar contraseña" name="password_confirmation" autoComplete="new-password" minLength={8} error={fieldErrors.password_confirmation} />
                <div>
                    <label className="block">Tipo de cuenta<select className={inputClass('role')} name="role" defaultValue={credentials.role} {...errorProps('role')}><option value="HUESPED">Huésped</option><option value="ANFITRION">Anfitrión</option></select></label>
                    <AuthFieldError field="role" message={fieldErrors.role} />
                </div>
            </>}
            {formError && <p role="alert" className="text-red-700">{formError}</p>}
            <button type="submit" disabled={auth.submitDisabled} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{auth.submitLabel}</button>
        </form>
        {auth.showForgotPassword && <Link className="mt-4 block text-blue-700" to={auth.forgotPasswordTo}>Olvidé mi contraseña</Link>}
        <p className="mt-4 text-xs text-slate-500">Por seguridad, 10 intentos fallidos de contraseña o código bloquean el acceso durante 24 horas.</p>
        <Link {...auth.alternativeLink} className="mt-4 block text-blue-700">{auth.alternativeLabel}</Link>
        </>}
    </>;
}
