import { useMfaChallengeForm } from '../../../hooks/auth/mfa/useMfaChallengeForm';
import type { MfaChallengeFormProps } from '../../../types/auth';
import AuthCountdown from '../shared/AuthCountdown';
import AuthFieldError from '../shared/AuthFieldError';

export default function MfaChallengeForm(props: MfaChallengeFormProps) {
    const mfa = useMfaChallengeForm(props);

    return <>
        <p className="mb-6 text-slate-600">Enviamos un código de 6 dígitos a <strong className="break-all text-slate-800">{mfa.challenge.masked_email}</strong>. Ingrésalo para completar la autenticación.</p>
        <form onSubmit={mfa.onSubmit} className="space-y-4" aria-busy={mfa.pending}>
            <div>
                <label htmlFor="auth-code" className="block font-medium">Código de verificación</label>
                <input id="auth-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6}
                    autoFocus {...mfa.codeInputProps} />
                <AuthFieldError field="code" message={mfa.codeError} />
                <p id="auth-code-hint" className="mt-2 text-sm text-slate-600">El código vence en <AuthCountdown seconds={mfa.expiresIn} />.</p>
            </div>
            {mfa.formError && <p role="alert" className="text-red-700">{mfa.formError}</p>}
            {mfa.notice && <p role="status" className="text-sm text-green-800">{mfa.notice}</p>}
            <button type="submit" disabled={mfa.verifyDisabled}
                className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{mfa.verifyLabel}</button>
        </form>
        <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">Si no encuentras el correo, revisa la carpeta de spam.</p>
            <button type="button" onClick={mfa.onResend} disabled={mfa.resendDisabled}
                className="w-full rounded-lg border border-blue-700 px-4 py-2 text-blue-700 disabled:border-slate-300 disabled:text-slate-500">
                {mfa.resendLabel}{mfa.showResendCountdown && <AuthCountdown seconds={mfa.resendIn} />}
            </button>
            <button type="button" onClick={mfa.onCancel} disabled={mfa.cancelDisabled} className="w-full rounded-lg px-4 py-2 text-blue-700 disabled:opacity-50">
                {mfa.cancelLabel}
            </button>
        </div>
    </>;
}
