import http, { sessionHttp } from '../../../api/http';
import type { Property, PropertyImage } from '../../../types/property';

export interface Department { id: number; name: string; code: string }
export interface City { id: number; department_id: number; name: string; code: string }
/** Valores tal como los escribe el anfitrión; el backend los valida y convierte. */
export interface PropertyInput {
    name: string; description: string; property_type: string; address: string;
    city_id: string; max_guests: string; bathrooms: string; bedrooms: string; beds: string;
    price: string; currency: string; check_in_time: string | null; check_out_time: string | null;
}
export interface PropertyPage { data: Property[]; current_page: number; last_page: number; total: number }
export async function getDepartments(signal?: AbortSignal) {
    return (await http.get<{ data: Department[] }>('/public/departments', { signal })).data.data;
}
export async function getCities(department: string, signal?: AbortSignal) {
    return (await http.get<{ data: City[] }>(`/public/departments/${department}/cities`, { signal })).data.data;
}
export async function getHostProperties(page: number, signal?: AbortSignal) {
    return (await http.get<{ data: PropertyPage }>('/property', { params: { page }, signal })).data.data;
}
export async function getHostProperty(id: number, signal?: AbortSignal) {
    return (await http.get<{ data: Property }>(`/property/${id}`, { signal })).data.data;
}
/** Valida en el backend (Laravel Precognition) solo los campos indicados, sin guardar nada. */
export async function validatePropertyFields(data: Partial<PropertyInput>, fields: readonly (keyof PropertyInput)[]) {
    await sessionHttp.get('/sanctum/csrf-cookie');
    await http.post('/property', data, { headers: { Precognition: 'true', 'Precognition-Validate-Only': fields.join(',') } });
}
/** Registra el alojamiento completo, con sus fotografías, y queda publicado. */
export async function createProperty(data: PropertyInput, images: File[]) {
    await sessionHttp.get('/sanctum/csrf-cookie');
    const body = new FormData();
    Object.entries(data).forEach(([key, value]) => { if (value !== null) body.append(key, String(value)); });
    images.forEach((image) => body.append('images[]', image));
    return (await http.post<{ data: Property }>('/property', body)).data.data;
}
export async function getPropertyImages(propertyId: number, signal?: AbortSignal) {
    return (await http.get<{ data: PropertyImage[] }>('/property-images', { params: { property_id: propertyId }, signal })).data.data;
}
export async function uploadImage(propertyId: number, file: File) {
    await sessionHttp.get('/sanctum/csrf-cookie');
    const data = new FormData();
    data.append('property_id', String(propertyId));
    data.append('image', file);
    return (await http.post<{ data: PropertyImage }>('/property-images', data)).data.data;
}
export async function publishProperty(id: number) {
    await sessionHttp.get('/sanctum/csrf-cookie');
    return (await http.patch<{ data: Property }>(`/property/${id}`, { is_active: true })).data.data;
}
