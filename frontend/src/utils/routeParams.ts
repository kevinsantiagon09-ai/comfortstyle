/** Convierte un parámetro de la URL en un id entero positivo, o `null` si no es válido. */
export function toPositiveId(value: string | null | undefined): number | null {
    const id = Number(value ?? NaN);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Devuelve el parámetro de la URL si es un UUID válido, o `null`. */
export function toUuid(value: string | null | undefined): string | null {
    return value && UUID_PATTERN.test(value) ? value.toLowerCase() : null;
}
