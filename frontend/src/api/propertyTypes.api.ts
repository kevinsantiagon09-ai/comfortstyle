import http, { ensureCsrfCookie } from './http';
import type { ApiResponse } from '../types/api';
import type { PropertyType, PropertyTypeInput } from '../types/propertyType';

/** Tipos que el anfitrión puede elegir: los globales y los que creó. */
export async function getHostPropertyTypes(signal?: AbortSignal) {
    return (await http.get<ApiResponse<PropertyType[]>>('/host/property-types', { signal })).data.data;
}

/** Crea un tipo privado del anfitrión. */
export async function createPropertyType(data: PropertyTypeInput) {
    await ensureCsrfCookie();
    return (await http.post<ApiResponse<PropertyType>>('/host/property-types', data)).data.data;
}

/** Renombra un tipo del anfitrión; los globales responden 403. */
export async function updatePropertyType(uuid: string, data: PropertyTypeInput) {
    await ensureCsrfCookie();
    return (await http.patch<ApiResponse<PropertyType>>(`/host/property-types/${uuid}`, data)).data.data;
}
