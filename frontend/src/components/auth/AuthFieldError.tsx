import type { AuthFieldErrorProps } from '../../types/auth';

export default function AuthFieldError({ field, message }: AuthFieldErrorProps) {
    return message ? <p id={`auth-${field}-error`} className="mt-1 text-sm text-red-700">{message}</p> : null;
}
