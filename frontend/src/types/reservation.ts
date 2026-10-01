import type { Property } from './property';

export type ReservationStatus = 'CONFIRMADA' | 'CANCELADA';

export interface Reservation {
    id: number;
    uuid: string;
    property_id: number;
    user_id: number;
    check_in: string;
    check_out: string;
    guests: number;
    nights: number;
    price_per_night: string;
    total_price: string;
    currency: string;
    status: ReservationStatus;
    property?: Property;
}

/** Lo que envía el huésped; el total lo calcula el backend. */
export interface ReservationInput {
    property_id: number;
    check_in: string;
    check_out: string;
    guests: number;
}

// Props de componentes
export interface ReservationFormProps {
    property: Property;
}

export interface ReservationCardProps {
    reservation: Reservation;
    cancelling: boolean;
    onCancel: (id: number) => void;
}
