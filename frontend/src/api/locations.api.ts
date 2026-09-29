import http from './http';
import type { ApiResponse } from '../types/api';
import type { City, Department } from '../types/location';

export async function getDepartments(signal?: AbortSignal) {
    return (await http.get<ApiResponse<Department[]>>('/public/departments', { signal })).data.data;
}

export async function getCities(departmentId: string, signal?: AbortSignal) {
    return (await http.get<ApiResponse<City[]>>(`/public/departments/${departmentId}/cities`, { signal })).data.data;
}
