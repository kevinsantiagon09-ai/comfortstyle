import http from './http';
import type { ApiResponse } from '../types/api';
import type { PropertyType } from '../types/propertyType';

export async function getPropertyTypes(signal?: AbortSignal) {
    return (await http.get<ApiResponse<PropertyType[]>>('/public/property-types', { signal })).data.data;
}
