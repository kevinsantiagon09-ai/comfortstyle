import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { FieldErrors } from './api';
import type { Property, PropertyInput } from './property';

/** Formulario del alojamiento, compartido por el registro y la edición. */
export interface SetupForm {
    name: string;
    description: string;
    property_type: string;
    address: string;
    departmentId: string;
    cityId: string;
    max_guests: string;
    bathrooms: string;
    bedrooms: string;
    beds: string;
    price: string;
    currency: string;
    check_in_time: string;
    check_out_time: string;
    amenities: number[];
}

export type SetupField = Exclude<keyof SetupForm, 'amenities'>;

/** Campo que el backend valida en un paso del registro. */
export type StepField = keyof PropertyInput | 'images';

export interface SetupStep {
    label: string;
    icon: LucideIcon;
}

export interface PropertySetupState {
    step: number;
    form: SetupForm;
    setField: (key: SetupField, value: string) => void;
    toggleAmenity: (id: number) => void;
    next: () => void;
    back: () => void;
    goTo: (step: number) => void;
    reset: () => void;
}

// Props de componentes
export interface SectionProps {
    form: SetupForm;
    errors: FieldErrors;
    change: (key: SetupField, value: string) => void;
}

export interface DetailsFieldsProps extends SectionProps {
    autoFocus?: boolean;
}

export interface FormSectionProps {
    step: SetupStep;
    children: ReactNode;
}

export interface SetupProgressProps {
    activeStep: number;
}

export interface PropertySetupWizardProps {
    onCreated: (propertyId: number) => void;
}

export interface PropertyEditFormProps {
    property: Property;
}

export interface PhotoPickerProps {
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
    error?: string;
}

export interface PhotosStepProps {
    propertyId: number;
}
