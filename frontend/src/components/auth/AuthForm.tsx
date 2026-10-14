import { Link, Navigate } from 'react-router-dom';
import { useAuthForm } from '../../hooks/auth/useAuthForm';
import { forgotPasswordPath, paths } from '../../routes/paths';
import type { AuthField, AuthFormProps } from '../../types/auth';
import PasswordField from '../ui/PasswordField';
import AuthFieldError from './AuthFieldError';
import AuthLockNotice from './AuthLockNotice';
import MfaChallengeForm from './MfaChallengeForm';

export default function AuthForm({ registerMode: initialRegisterMode = false }: AuthFormProps) {
    const auth = useAuthForm(initialRegisterMode);
    const { loading, redirectTo, registerMode, phase, credentials, credentialVersion, pending, lockSeconds, lockMessage, fieldErrors, formError, submit, resetErrors, handleChange, errorProps } = auth;
    if (loading) return <p role="status">Cargando sesión...</p>;
    if (redirectTo) return <Navigate to={redirectTo} replace />;
    const inputClass = (field: AuthField) => `mt-1 w-full rounded-lg border px-3 py-2 ${fieldErrors[field] ? 'border-red-600' : 'border-slate-300'}`;

    return <>
        <h1 className="mb-6 text-3xl font-bold">{phase.step === 'mfa' ? 'Verifica tu correo' : registerMode ? 'Crear una cuenta' : 'Iniciar sesión'}</h1>
        {lockSeconds > 0 && <div className="mb-4"><AuthLockNotice seconds={lockSeconds} message={lockMessage} /></div>}
        {phase.step === 'mfa' ? <MfaChallengeForm challenge={phase.challenge} code={auth.code} codeError={fieldErrors.code}
            formError={formError} notice={auth.notice} expiresIn={auth.expiresIn} resendIn={auth.resendIn}
            pending={pending} verifying={auth.verifying} resending={auth.resending} canceling={auth.canceling} blocked={lockSeconds > 0} accountCreated={auth.accountCreated}
            onCodeChange={auth.changeCode} onSubmit={auth.submitCode} onResend={auth.resendCode} onCancel={auth.cancelChallenge} /> : <>
        <p className="mb-6 text-sm text-slate-600">{registerMode ? 'Confirmaremos tu correo con un código para completar el registro.' : 'Después de ingresar tus datos, confirma tu identidad con un código enviado a tu correo.'}</p>
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
            <PasswordField label="Contraseña" name="password" autoComplete={registerMode ? 'new-password' : 'current-password'} minLength={registerMode ? 8 : undefined} error={fieldErrors.password} />
            {registerMode && <>
                <p className="text-sm text-slate-600">Usa al menos 8 caracteres, incluyendo letras y números.</p>
                <PasswordField label="Confirmar contraseña" name="password_confirmation" autoComplete="new-password" minLength={8} error={fieldErrors.password_confirmation} />
                <div>
                    <label className="block">Tipo de cuenta<select className={inputClass('role')} name="role" defaultValue={credentials.role} {...errorProps('role')}><option value="HUESPED">Huésped</option><option value="ANFITRION">Anfitrión</option></select></label>
                    <AuthFieldError field="role" message={fieldErrors.role} />
                </div>
            </>}
            {formError && <p role="alert" className="text-red-700">{formError}</p>}
            <button type="submit" disabled={pending || lockSeconds > 0} className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{pending ? 'Procesando...' : 'Continuar'}</button>
        </form>
        {!registerMode && <Link className="mt-4 block text-blue-700" to={forgotPasswordPath(credentials.email)}>Olvidé mi contraseña</Link>}
        <p className="mt-4 text-xs text-slate-500">Por seguridad, 10 intentos fallidos de contraseña o código bloquean el acceso durante 24 horas.</p>
        <Link onClick={initialRegisterMode && auth.accountCreated ? auth.restartRegistration : resetErrors} className="mt-4 block text-blue-700" to={registerMode ? paths.login : paths.register}>{registerMode ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</Link>
        </>}
    </>;
}
