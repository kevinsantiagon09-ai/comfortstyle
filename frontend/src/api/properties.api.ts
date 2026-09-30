import http, { ensureCsrfCookie } from './http';
import type { ApiResponse, Paginated } from '../types/api';
import type { Property, PropertyInput } from '../types/property';

/** Catálogo público: solo alojamientos publicados. */
export async function getPublicProperties(signal?: AbortSignal) {
    const response = await http.get<ApiResponse<Paginated<Property>>>('/public/properties', { signal, params: { solo_activos: true } });
    return response.data.data.data;
}

/** Detalle público de un alojamiento publicado, con fotos, comodidades y anfitrión. */
export async function getPublicProperty(uuid: string, signal?: AbortSignal) {
    return (await http.get<ApiResponse<Property>>(`/public/properties/${uuid}`, { signal })).data.data;
}

export async function getHostProperties(page: number, signal?: AbortSignal) {
    return (await http.get<ApiResponse<Paginated<Property>>>('/property', { params: { page }, signal })).data.data;
}

export async function getHostProperty(uuid: string, signal?: AbortSignal) {
    return (await http.get<ApiResponse<Property>>(`/property/${uuid}`, { signal })).data.data;
}

/** Valida en el backend (Laravel Precognition) solo los campos indicados, sin guardar nada. */
export async function validatePropertyFields(data: Partial<PropertyInput>, fields: readonly (keyof PropertyInput)[]) {
    await ensureCsrfCookie();
    await http.post('/property', data, { headers: { Precognition: 'true', 'Precognition-Validate-Only': fields.join(',') } });
}

/** Registra el alojamiento completo, con sus fotografías, y queda publicado. */
export async function createProperty(data: PropertyInput, images: File[]) {
    await ensureCsrfCookie();
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((item) => body.append(`${key}[]`, String(item)));
        else if (value !== null) body.append(key, String(value));
    });
    images.forEach((image) => body.append('images[]', image));
    return (await http.post<ApiResponse<Property>>('/property', body)).data.data;
}

/** Actualiza los datos del alojamiento (las fotos se gestionan aparte). */
export async function updateProperty(uuid: string, data: PropertyInput) {
    await ensureCsrfCookie();
    return (await http.patch<ApiResponse<Property>>(`/property/${uuid}`, data)).data.data;
}

export async function publishProperty(uuid: string) {
    await ensureCsrfCookie();
    return (await http.patch<ApiResponse<Property>>(`/property/${uuid}`, { is_active: true })).data.data;
}
