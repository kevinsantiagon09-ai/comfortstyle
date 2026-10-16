import type { PropertyType } from '../types/propertyType';

/** Agrega o reemplaza un tipo en la lista, que se mantiene ordenada por nombre como la entrega el backend. */
export const upsertPropertyType = (types: PropertyType[] | undefined, type: PropertyType) =>
    [...(types ?? []).filter((item) => item.id !== type.id), type].sort((a, b) => a.name.localeCompare(b.name, 'es'));
