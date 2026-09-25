import http from './http';
import type { Property } from '../types/property';

interface PaginatedProperties {
    current_page: number;
    data: Property[];
    last_page: number;
    per_page: number;
    total: number;
}

interface PropertiesResponse {
    message: string;
    data: PaginatedProperties;
}

export async function getProperties(signal?: AbortSignal): Promise<Property[]> {
    const response = await http.get<PropertiesResponse>(
        '/public/properties',
        {
            signal,
            params: {
                solo_activos: true,
            },
        }
    );

    return response.data.data.data;
}