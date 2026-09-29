/** Envoltura estándar de las respuestas de Laravel: `{ message, data }`. */
export interface ApiResponse<T> {
    message?: string;
    data: T;
}

/** Página de resultados del paginador de Laravel. */
export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

/** Cuerpo de un error de Laravel (incluye los de validación 422). */
export interface ApiErrorBody {
    message?: string;
    errors?: Record<string, string[]>;
}

/** Mensaje de error por nombre de campo. */
export type FieldErrors = Record<string, string>;
