import type { Property } from '../types/property';

/** Foto marcada como portada o, si no hay, la primera. */
export const toTitleCase = (text: string) =>
    text.toLocaleLowerCase('es-CO').replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase('es-CO'));