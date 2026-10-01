import http, { ensureCsrfCookie } from './http';
import type { ApiResponse, Paginated } from '../types/api';
import type { Reservation, ReservationInput } from '../types/reservation';

/** Reservas del huésped conectado, paginadas. */
export async function getMyReservations(page: number, signal?: AbortSignal) {
    return (await http.get<ApiResponse<Paginated<Reservation>>>('/reservations', { params: { page }, signal })).data.data;
}

export async function createReservation(data: ReservationInput) {
    await ensureCsrfCookie();
    return (await http.post<ApiResponse<Reservation>>('/reservations', data)).data.data;
}

export async function cancelReservation(id: number) {
    await ensureCsrfCookie();
    return (await http.patch<ApiResponse<Reservation>>(`/reservations/${id}/cancel`)).data.data;
}
