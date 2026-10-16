import type { FieldErrorProps } from '../../types/ui';

export default function FieldError({ message }: FieldErrorProps) {
    return message ? <span role="alert" className="mt-1.5 block text-sm font-medium text-red-700">{message}</span> : null;
}
