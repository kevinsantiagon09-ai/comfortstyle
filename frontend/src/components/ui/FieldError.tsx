import type { FieldErrorProps } from '../../types/ui';

export default function FieldError({ message }: FieldErrorProps) {
    return message ? <span role="alert" className="mt-1 block text-sm text-red-700">{message}</span> : null;
}
