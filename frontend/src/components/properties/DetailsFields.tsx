import { PROPERTY_TYPES } from '../../constants/propertySetup';
import { FORM_FIELD_CLASS as field } from '../../constants/styles';
import type { DetailsFieldsProps } from '../../types/propertyForm';
import FieldError from '../ui/FieldError';

export default function DetailsFields({ form, errors, change, autoFocus }: DetailsFieldsProps) {
    return <>
        <label className="block">Nombre del alojamiento<input autoFocus={autoFocus} className={field} aria-invalid={!!errors.name} maxLength={150} value={form.name} onChange={e => change('name', e.target.value)} placeholder="Una casa tranquila cerca del centro" /><FieldError message={errors.name} /></label>
        <label className="block">Tipo de alojamiento<select className={field} aria-invalid={!!errors.property_type} value={form.property_type} onChange={e => change('property_type', e.target.value)}>{PROPERTY_TYPES.map(type => <option key={type}>{type}</option>)}</select><FieldError message={errors.property_type} /></label>
        <label className="block">Descripción<textarea className={field} aria-invalid={!!errors.description} maxLength={3000} rows={5} value={form.description} onChange={e => change('description', e.target.value)} placeholder="Cuéntales a tus huéspedes qué hace especial este lugar." /><FieldError message={errors.description} /></label>
    </>;
}
