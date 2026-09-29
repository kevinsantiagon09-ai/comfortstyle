import http, { ensureCsrfCookie } from './http';
import type { ApiResponse } from '../types/api';
import type { PropertyImage } from '../types/property';

export async function getPropertyImages(propertyId: number, signal?: AbortSignal) {
    return (await http.get<ApiResponse<PropertyImage[]>>('/property-images', { params: { property_id: propertyId }, signal })).data.data;
}

export async function uploadPropertyImage(propertyId: number, file: File) {
    await ensureCsrfCookie();
    const data = new FormData();
    data.append('property_id', String(propertyId));
    data.append('image', file);
    return (await http.post<ApiResponse<PropertyImage>>('/property-images', data)).data.data;
}
