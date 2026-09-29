import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { paths } from '../../routes/paths';
import type { Property } from '../../types/property';
import type { SetupField, SetupForm } from '../../types/propertyForm';
import { fieldErrors } from '../../utils/apiError';
import { applyFieldChange, backendField, fromProperty, toggleId, toInput } from '../../utils/propertyForm';
import { useFieldErrors } from '../ui/useFieldErrors';
import { useUpdateProperty } from './useUpdateProperty';

export function usePropertyEditForm(property: Property) {
    const navigate = useNavigate();
    const update = useUpdateProperty(property.id);
    const [form, setForm] = useState<SetupForm>(() => fromProperty(property));
    const { errors, setErrors, clearError, hasErrors } = useFieldErrors();

    const change = (key: SetupField, value: string) => {
        setForm((current) => applyFieldChange(current, key, value));
        clearError(backendField(key));
    };
    const toggleAmenity = (id: number) => {
        setForm((current) => ({ ...current, amenities: toggleId(current.amenities, id) }));
        clearError('amenities');
    };
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (update.isPending) return;
        update.mutate(toInput(form), {
            onSuccess: () => navigate(paths.host),
            onError: (error) => setErrors(fieldErrors(error)),
        });
    };

    return {
        form,
        errors,
        hasErrors,
        pending: update.isPending,
        requestError: update.error,
        showRequestError: update.error !== null && Object.keys(fieldErrors(update.error)).length === 0,
        change,
        toggleAmenity,
        submit,
    };
}
