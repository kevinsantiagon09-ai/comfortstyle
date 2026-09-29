export interface PasswordFieldProps {
    label: string;
    name: string;
    autoComplete: 'new-password' | 'current-password';
    minLength?: number;
    error?: string;
}

export interface FieldErrorProps {
    message?: string;
}

export interface PaginationProps {
    /** Página solicitada, controla los botones. */
    page: number;
    /** Página que se está mostrando. */
    currentPage: number;
    lastPage: number;
    onPrevious: () => void;
    onNext: () => void;
    nextDisabled?: boolean;
}
