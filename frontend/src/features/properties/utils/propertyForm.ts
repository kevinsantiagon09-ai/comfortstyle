import type { Property } from '../../../types/property';
import type { PropertyInput } from '../api/hostProperties.api';
import type { SetupField, SetupForm } from '../store/usePropertySetupStore';

/** Nombre del campo en el backend → campo del formulario, cuando difieren. */
const formField: Partial<Record<string, SetupField>> = { city_id: 'cityId' };

export const backendField = (key: SetupField) => Object.keys(formField).find((name) => formField[name] === key) ?? key;

export const toInput = (form: SetupForm): PropertyInput => ({
    name: form.name.trim(), description: form.description.trim(), property_type: form.property_type,
    address: form.address.trim(), city_id: form.cityId, max_guests: form.max_guests,
    bathrooms: form.bathrooms, bedrooms: form.bedrooms, beds: form.beds,
    price: form.price, currency: form.currency,
    check_in_time: form.check_in_time || null, check_out_time: form.check_out_time || null,
    amenities: form.amenities,
});

/** Datos guardados del alojamiento → formulario editable. Las horas llegan como HH:MM:SS. */
export const fromProperty = (property: Property): SetupForm => ({
    name: property.name, description: property.description, property_type: property.property_type,
    address: property.address, departmentId: property.department_id ? String(property.department_id) : '',
    cityId: String(property.city_id), max_guests: String(property.max_guests), bathrooms: String(property.bathrooms),
    bedrooms: String(property.bedrooms), beds: String(property.beds), price: String(Number(property.price)),
    currency: property.currency, check_in_time: property.check_in_time?.slice(0, 5) ?? '',
    check_out_time: property.check_out_time?.slice(0, 5) ?? '', amenities: property.amenities?.map((amenity) => amenity.id) ?? [],
});

export const without = (errors: Record<string, string>, key: string) => Object.fromEntries(Object.entries(errors).filter(([name]) => name !== key));

export const formatPrice = (property: Pick<Property, 'price' | 'currency'>) =>
    `$${Number(property.price).toLocaleString('es-CO')} ${property.currency}`;
