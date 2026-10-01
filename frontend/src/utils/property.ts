import type { Property } from '../types/property';

/** Foto marcada como portada o, si no hay, la primera. */
export const coverImage = (property: Property) =>
    property.images?.find((image) => image.is_cover) ?? property.images?.[0];

/** Pone en mayúscula la primera letra de cada palabra. */
export const toTitleCase = (text: string) =>
    text.toLocaleLowerCase('es-CO').replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-CO'));
