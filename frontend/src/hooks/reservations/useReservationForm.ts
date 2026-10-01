import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import type { Property } from '../../types/property';
import { apiError, fieldErrors } from '../../utils/apiError';
import { hasRole } from '../../utils/auth';
import { formatMoney, nightsBetween, todayIso } from '../../utils/reservation';
import { useAuth } from '../auth/useAuth';
import { useFieldErrors } from '../ui/useFieldErrors';
import { useCreateReservation } from './useCreateReservation';

export function useReservationForm(property: Property) {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const create = useCreateReservation();
    const { errors, setErrors, clearError } = useFieldErrors();
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const nights = nightsBetween(checkIn, checkOut);
    /** Los errores de validación se muestran bajo su campo; el resto, como mensaje general. */
    const hasFieldErrors = Object.keys(fieldErrors(create.error)).length > 0;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (create.isPending) return;
        setErrors({});
        create.mutate(
            { property_id: property.id, check_in: checkIn, check_out: checkOut, guests },
            {
                onSuccess: () => navigate(paths.guest),
                onError: (error) => setErrors(fieldErrors(error)),
            },
        );
    };

    return {
        isAuthenticated,
        canReserve: hasRole(user, 'HUESPED'),
        checkIn,
        checkOut,
        guests,
        minCheckIn: todayIso(),
        maxGuests: property.max_guests,
        changeCheckIn: (value: string) => {
            setCheckIn(value);
            clearError('check_in');
        },
        changeCheckOut: (value: string) => {
            setCheckOut(value);
            clearError('check_out');
        },
        changeGuests: (value: number) => {
            setGuests(value);
            clearError('guests');
        },
        nights,
        total: formatMoney(nights * Number(property.price)),
        errors,
        formError: create.isError && !hasFieldErrors ? apiError(create.error) : null,
        pending: create.isPending,
        submit,
    };
}
