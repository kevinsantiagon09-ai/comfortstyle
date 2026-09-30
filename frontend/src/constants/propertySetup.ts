import { BadgeDollarSign, Camera, House, MapPin, Rotate3d, Sparkles } from 'lucide-react';
import type { SetupField, SetupForm, SetupStep, StepField } from '../types/propertyForm';

/** Pasos del registro de un alojamiento, en orden. */
export const SETUP_STEPS: SetupStep[] = [
    { label: 'Tu alojamiento', icon: House },
    { label: 'Ubicación', icon: MapPin },
    { label: 'Capacidad y precio', icon: BadgeDollarSign },
    { label: 'Fotografías', icon: Camera },
    { label: 'Comodidades', icon: Sparkles },
];

/** La edición agrega el recorrido 360° como última pestaña; en el registro va dentro del paso de fotos. */
export const EDIT_TABS: SetupStep[] = [...SETUP_STEPS, { label: 'Recorrido 360°', icon: Rotate3d }];
export const PANORAMA_TAB = SETUP_STEPS.length;

export const LAST_STEP = SETUP_STEPS.length - 1;

/** Paso de las fotos: se validan en el navegador porque solo se envían al registrar. */
export const PHOTOS_STEP = 3;

/** Campos que el backend valida en cada paso. */
export const STEP_FIELDS: StepField[][] = [
    ['name', 'property_type', 'description'],
    ['city_id', 'address', 'latitude', 'longitude'],
    ['max_guests', 'bedrooms', 'beds', 'bathrooms', 'price', 'currency', 'check_in_time', 'check_out_time'],
    ['images'],
    ['amenities'],
];

export const INITIAL_SETUP_FORM: SetupForm = {
    name: '', description: '', property_type: 'Casa', address: '', latitude: '', longitude: '', departmentId: '', cityId: '',
    max_guests: '2', bathrooms: '1', bedrooms: '1', beds: '1', price: '', currency: 'COP',
    check_in_time: '15:00', check_out_time: '11:00',
    amenities: [],
};

export const SETUP_STORAGE_KEY = 'comfortstyle:property-setup';

export const PROPERTY_TYPES = ['Casa', 'Apartamento', 'Cabaña', 'Habitación', 'Finca'];

export const CURRENCIES = ['COP', 'USD', 'EUR'];

export const CAPACITY_FIELDS: { key: SetupField; label: string }[] = [
    { key: 'max_guests', label: 'Huéspedes' },
    { key: 'bedrooms', label: 'Habitaciones' },
    { key: 'beds', label: 'Camas' },
    { key: 'bathrooms', label: 'Baños' },
];
