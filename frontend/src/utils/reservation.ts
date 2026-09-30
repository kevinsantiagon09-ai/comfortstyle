import type { Reservation } from '../types/reservation';

/** Fecha local de hoy en formato YYYY-MM-DD, el que usan los input type="date". */
export const todayIso = () => new Date().toLocaleDateString('en-CA');

/** Noches entre dos fechas YYYY-MM-DD; 0 si falta alguna o no están en orden. */
export function nightsBetween(checkIn: string, checkOut: string): number {
    if (!checkIn || !checkOut) return 0;
    const days = (Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000;
    return days > 0 ? days : 0;
}

/** Solo se cancela una reserva confirmada que aún no empieza (el backend lo vuelve a comprobar). */
export const canCancel = (reservation: Reservation) =>
    reservation.status === 'CONFIRMADA' && reservation.check_in > todayIso();

export const formatMoney = (value: number | string) => Number(value).toLocaleString('es-CO');
