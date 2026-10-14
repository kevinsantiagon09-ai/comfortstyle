import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { EDIT_TABS, STEP_FIELDS } from '../../constants/propertySetup';
import { paths } from '../../routes/paths';
import type { Property } from '../../types/property';
import type { SetupField, SetupForm } from '../../types/propertyForm';
import { fieldErrors } from '../../utils/apiError';
import { applyFieldChange, backendField, fromProperty, toggleId, toInput } from '../../utils/propertyForm';
import { useFieldErrors } from '../ui/useFieldErrors';
import { useTabs } from '../ui/useTabs';
import { useUpdateProperty } from './useUpdateProperty';

/** Edición por pestañas: el formulario se conserva al cambiar de pestaña y se guarda completo. */
export function usePropertyEditForm(property: Property) {
    const navigate = useNavigate();
    const update = useUpdateProperty(property.uuid);
    const tabs = useTabs(EDIT_TABS.length);
    const [form, setForm] = useState<SetupForm>(() => fromProperty(property));
    const { errors, setErrors, clearError, hasErrors } = useFieldErrors();
    const tabsWithErrors = STEP_FIELDS.flatMap((fields, index) => fields.some((name) => name in errors) ? [index] : []);

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
            onError: (error) => {
                const found = fieldErrors(error);
                setErrors(found);
                // Si el error está en otra pestaña, la abre.
                const firstTab = STEP_FIELDS.findIndex((fields) => fields.some((name) => name in found));
                if (firstTab >= 0) tabs.select(firstTab);
            },
        });
    };

    return {
        tabs,
        tabsWithErrors,
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
