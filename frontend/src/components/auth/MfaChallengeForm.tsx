import type { FormEvent } from 'react';
import type { MfaChallenge } from '../../types/auth';
import AuthCountdown from './AuthCountdown';
import AuthFieldError from './AuthFieldError';

interface MfaChallengeFormProps {
    challenge: MfaChallenge;
    code: string;
    codeError?: string;
    formError: string;
    notice: string;
    expiresIn: number;
    resendIn: number;
    pending: boolean;
    verifying: boolean;
    resending: boolean;
    canceling: boolean;
    blocked: boolean;
    accountCreated: boolean;
    onCodeChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onResend: () => void;
    onCancel: () => void;
}

export default function MfaChallengeForm({ challenge, code, codeError, formError, notice, expiresIn, resendIn, pending, verifying, resending, canceling, blocked, accountCreated, onCodeChange, onSubmit, onResend, onCancel }: MfaChallengeFormProps) {
    return <>
        <p className="mb-6 text-slate-600">Enviamos un código de 6 dígitos a <strong className="break-all text-slate-800">{challenge.masked_email}</strong>. Ingrésalo para completar la autenticación.</p>
        <form onSubmit={onSubmit} className="space-y-4" aria-busy={pending}>
            <div>
                <label htmlFor="auth-code" className="block font-medium">Código de verificación</label>
                <input id="auth-code" name="code" type="text" inputMode="numeric" autoComplete="one-time-code" required pattern="[0-9]{6}" maxLength={6}
                    value={code} onChange={(event) => onCodeChange(event.target.value)}
                    onPaste={(event) => { event.preventDefault(); onCodeChange(event.clipboardData.getData('text')); }}
                    autoFocus disabled={pending || blocked || expiresIn <= 0}
                    aria-invalid={codeError ? true : undefined} aria-describedby={codeError ? 'auth-code-hint auth-code-error' : 'auth-code-hint'}
                    className={`mt-1 w-full rounded-lg border px-3 py-3 text-center text-2xl tracking-[0.4em] disabled:bg-slate-100 ${codeError ? 'border-red-600' : 'border-slate-300'}`} />
                <AuthFieldError field="code" message={codeError} />
                <p id="auth-code-hint" className="mt-2 text-sm text-slate-600">El código vence en <AuthCountdown seconds={expiresIn} />.</p>
            </div>
            {formError && <p role="alert" className="text-red-700">{formError}</p>}
            {notice && <p role="status" className="text-sm text-green-800">{notice}</p>}
            <button type="submit" disabled={pending || blocked || expiresIn <= 0 || code.length !== 6}
                className="w-full rounded-lg bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{verifying ? 'Verificando...' : 'Verificar y continuar'}</button>
        </form>
        <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600">Si no encuentras el correo, revisa la carpeta de spam.</p>
            <button type="button" onClick={onResend} disabled={pending || blocked || resendIn > 0 || expiresIn <= 0}
                className="w-full rounded-lg border border-blue-700 px-4 py-2 text-blue-700 disabled:border-slate-300 disabled:text-slate-500">
                {resending ? 'Enviando...' : resendIn > 0 ? <>Reenviar código en <AuthCountdown seconds={resendIn} /></> : 'Reenviar código'}
            </button>
            <button type="button" onClick={onCancel} disabled={pending} className="w-full rounded-lg px-4 py-2 text-blue-700 disabled:opacity-50">
                {canceling ? 'Volviendo...' : accountCreated ? 'Volver al inicio de sesión' : 'Cambiar correo o volver'}
            </button>
        </div>
    </>;
}
