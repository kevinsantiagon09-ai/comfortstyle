import http from './http';
import type { ApiResponse } from '../types/api';
import type { Amenity } from '../types/amenity';

export async function getAmenities(signal?: AbortSignal) {
    return (await http.get<ApiResponse<Amenity[]>>('/public/amenities', { signal })).data.data;
}
