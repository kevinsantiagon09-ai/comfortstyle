import type { KeyboardEventHandler, RefCallback } from 'react';

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

/** Atributos de un botón de pestaña (patrón de pestañas accesibles). */
export interface TabButtonProps {
    id: string;
    type: 'button';
    role: 'tab';
    'aria-selected': boolean;
    'aria-controls': string;
    tabIndex: number;
    ref: RefCallback<HTMLButtonElement>;
    onClick: () => void;
    onKeyDown: KeyboardEventHandler<HTMLButtonElement>;
}

export interface TabPanelProps {
    id: string;
    role: 'tabpanel';
    'aria-labelledby': string;
}
