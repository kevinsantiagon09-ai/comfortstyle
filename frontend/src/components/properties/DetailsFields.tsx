import { FORM_FIELD_CLASS as field, FORM_HINT_CLASS as hint } from '../../constants/styles';
import type { DetailsFieldsProps } from '../../types/propertyForm';
import FieldError from '../ui/FieldError';
import PropertyTypeField from './PropertyTypeField';

export default function DetailsFields({ form, errors, change, autoFocus }: DetailsFieldsProps) {
    return <>
        <label className="block">Nombre del alojamiento
            <input autoFocus={autoFocus} className={field} aria-invalid={!!errors.name} maxLength={150} value={form.name} onChange={e => change('name', e.target.value)} placeholder="Una casa tranquila cerca del centro" />
            <FieldError message={errors.name} />
            <span className={hint}><span>Es lo primero que ven los huéspedes: corto y descriptivo.</span><span className="tabular-nums">{form.name.length}/150</span></span>
        </label>
        <PropertyTypeField value={form.property_type_id} error={errors.property_type_id} onChange={id => change('property_type_id', id)} />
        <label className="block">Descripción
            <textarea className={field} aria-invalid={!!errors.description} maxLength={3000} rows={6} value={form.description} onChange={e => change('description', e.target.value)} placeholder="Cuéntales a tus huéspedes qué hace especial este lugar." />
            <FieldError message={errors.description} />
            <span className={hint}><span>Habla del espacio, el entorno y lo que lo hace especial.</span><span className="tabular-nums">{form.description.length}/3000</span></span>
        </label>
    </>;
}
