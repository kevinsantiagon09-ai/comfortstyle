/** Convierte un parámetro de la URL en un id entero positivo, o `null` si no es válido. */
export function toPositiveId(value: string | null | undefined): number | null {
    const id = Number(value ?? NaN);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
}
