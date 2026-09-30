import type { AxiosProgressEvent } from 'axios';
import http, { ensureCsrfCookie } from './http';
import type { ApiResponse } from '../types/api';
import type { PanoramaUpload, PropertyPanorama } from '../types/panorama';

export async function getPropertyPanoramas(propertyId: number, signal?: AbortSignal) {
    return (await http.get<ApiResponse<PropertyPanorama[]>>('/property-panoramas', { params: { property_id: propertyId }, signal })).data.data;
}

/** Envía la foto 360° original y su vista previa; informa el avance porque la foto puede pesar varios MB. */
export async function uploadPropertyPanorama(propertyId: number, upload: PanoramaUpload, onProgress?: (percent: number) => void) {
    await ensureCsrfCookie();
    const data = new FormData();
    data.append('property_id', String(propertyId));
    data.append('title', upload.title);
    data.append('image', upload.image);
    data.append('preview', upload.preview, 'preview.jpg');
    const onUploadProgress = (event: AxiosProgressEvent) => {
        if (event.total) onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    return (await http.post<ApiResponse<PropertyPanorama>>('/property-panoramas', data, { onUploadProgress })).data.data;
}

export async function deletePropertyPanorama(id: number) {
    await ensureCsrfCookie();
    await http.delete(`/property-panoramas/${id}`);
}
