import { FORM_FIELD_CLASS as field } from '../../constants/styles';
import { usePropertyTypes } from '../../hooks/propertyTypes/usePropertyTypes';
import type { DetailsFieldsProps } from '../../types/propertyForm';
import FieldError from '../ui/FieldError';

export default function DetailsFields({ form, errors, change, autoFocus }: DetailsFieldsProps) {
    const propertyTypes = usePropertyTypes();

    return <>
        <label className="block">Nombre del alojamiento<input autoFocus={autoFocus} className={field} aria-invalid={!!errors.name} maxLength={150} value={form.name} onChange={e => change('name', e.target.value)} placeholder="Una casa tranquila cerca del centro" /><FieldError message={errors.name} /></label>
        <label className="block">Tipo de alojamiento<select className={field} aria-invalid={!!errors.property_type_id} disabled={propertyTypes.isPending} value={form.property_type_id} onChange={e => change('property_type_id', e.target.value)}>
            <option value="" disabled>{propertyTypes.isPending ? 'Cargando tipos…' : propertyTypes.isError ? 'No pudimos cargar los tipos' : 'Selecciona un tipo'}</option>
            {propertyTypes.data?.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
        </select><FieldError message={errors.property_type_id} /></label>
        <label className="block">Descripción<textarea className={field} aria-invalid={!!errors.description} maxLength={3000} rows={5} value={form.description} onChange={e => change('description', e.target.value)} placeholder="Cuéntales a tus huéspedes qué hace especial este lugar." /><FieldError message={errors.description} /></label>
    </>;
}
