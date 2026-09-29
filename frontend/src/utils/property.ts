import type { Property } from '../types/property';

/** Foto marcada como portada o, si no hay, la primera. */
export const coverImage = (property: Property) =>
    property.images?.find((image) => image.is_cover) ?? property.images?.[0];
