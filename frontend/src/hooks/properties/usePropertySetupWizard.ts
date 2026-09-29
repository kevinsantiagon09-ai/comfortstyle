import { useState, type FormEvent } from 'react';
import { LAST_STEP, PHOTOS_STEP, STEP_FIELDS } from '../../constants/propertySetup';
import { clearPropertySetup, usePropertySetupStore } from '../../store/propertySetupStore';
import type { PropertyInput } from '../../types/property';
import type { SetupField } from '../../types/propertyForm';
import { fieldErrors } from '../../utils/apiError';
import { backendField, toInput } from '../../utils/propertyForm';
import { useLocations } from '../locations/useLocations';
import { useFieldErrors } from '../ui/useFieldErrors';
import { useCreateProperty } from './useCreateProperty';
import { useValidatePropertyFields } from './useValidatePropertyFields';

/** Asistente de registro: valida cada paso en el backend y registra el alojamiento en el último. */
export function usePropertySetupWizard(onCreated: (propertyId: number) => void) {
    const { step, form, setField, toggleAmenity, next, back, goTo } = usePropertySetupStore();
    const { departments, cities } = useLocations(form.departmentId);
    const [photos, setPhotos] = useState<File[]>([]);
    const { errors, setErrors, clearError } = useFieldErrors();
    const validation = useValidatePropertyFields();
    const registration = useCreateProperty();

    const busy = validation.isPending || registration.isPending;
    const requestError = validation.error ?? registration.error;

    const change = (key: SetupField, value: string) => {
        setField(key, value);
        clearError(backendField(key));
    };
    const changePhotos = (files: File[]) => {
        setPhotos(files);
        clearError('images');
    };
    const toggle = (id: number) => {
        toggleAmenity(id);
        clearError('amenities');
    };
    const goBack = () => {
        validation.reset();
        registration.reset();
        setErrors({});
        back();
    };

    const validateStep = () => validation.mutate(
        { data: toInput(form), fields: STEP_FIELDS[step] as (keyof PropertyInput)[] },
        {
            onSuccess: () => { setErrors({}); next(); },
            onError: (error) => setErrors(fieldErrors(error)),
        },
    );
    const register = () => registration.mutate(
        { data: toInput(form), images: photos },
        {
            onSuccess: (property) => {
                clearPropertySetup();
                setPhotos([]);
                onCreated(property.id);
            },
            onError: (error) => {
                const found = fieldErrors(error);
                setErrors(found);
                // Lleva al anfitrión al primer paso que tenga un error del backend.
                const firstStep = STEP_FIELDS.findIndex((fields) => fields.some((name) => name in found));
                if (firstStep >= 0 && firstStep !== step) goTo(firstStep);
            },
        },
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        // Las fotos no sobreviven a una recarga: si faltan, se vuelve a su paso antes de registrar.
        if (step >= PHOTOS_STEP && photos.length === 0) {
            setErrors({ images: 'Agrega al menos una fotografía del alojamiento.' });
            goTo(PHOTOS_STEP);
            return;
        }
        if (step === PHOTOS_STEP) { setErrors({}); next(); return; }
        if (step < LAST_STEP) { validateStep(); return; }
        register();
    };

    return {
        step,
        form,
        photos,
        errors,
        busy,
        validating: validation.isPending,
        registering: registration.isPending,
        isLastStep: step === LAST_STEP,
        requestError,
        showRequestError: requestError !== null && Object.keys(fieldErrors(requestError)).length === 0,
        locationsUnavailable: step === 1 && (cities.isError || departments.isError),
        change,
        changePhotos,
        toggleAmenity: toggle,
        goBack,
        submit,
    };
}
