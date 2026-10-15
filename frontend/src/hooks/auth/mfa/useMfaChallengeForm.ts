import type { ChangeEvent, ClipboardEvent } from 'react';
import type { MfaChallengeFormProps } from '../../../types/auth';

export function useMfaChallengeForm(props: MfaChallengeFormProps) {
    const { code, codeError, pending, blocked, expiresIn, resendIn, verifying, resending, canceling, accountCreated, onCodeChange } = props;
    const inputDisabled = pending || blocked || expiresIn <= 0;

    const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
        onCodeChange(event.target.value);
    };

    const handleCodePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        onCodeChange(event.clipboardData.getData('text'));
    };

    return {
        ...props,
        codeInputProps: {
            value: code,
            onChange: handleCodeChange,
            onPaste: handleCodePaste,
            disabled: inputDisabled,
            'aria-invalid': codeError ? true : undefined,
            'aria-describedby': codeError ? 'auth-code-hint auth-code-error' : 'auth-code-hint',
            className: `mt-1 w-full rounded-lg border px-3 py-3 text-center text-2xl tracking-[0.4em] disabled:bg-slate-100 ${codeError ? 'border-red-600' : 'border-slate-300'}`,
        },
        verifyDisabled: inputDisabled || code.length !== 6,
        verifyLabel: verifying ? 'Verificando...' : 'Verificar y continuar',
        resendDisabled: inputDisabled || resendIn > 0,
        resendLabel: resending ? 'Enviando...' : resendIn > 0 ? 'Reenviar código en ' : 'Reenviar código',
        showResendCountdown: !resending && resendIn > 0,
        cancelDisabled: pending,
        cancelLabel: canceling ? 'Volviendo...' : accountCreated ? 'Volver al inicio de sesión' : 'Cambiar correo o volver',
    };
}
