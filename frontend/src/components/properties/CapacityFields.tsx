import { CAPACITY_FIELDS, CURRENCIES } from '../../constants/propertySetup';
import { FORM_FIELD_CLASS as field } from '../../constants/styles';
import type { SectionProps } from '../../types/propertyForm';
import FieldError from '../ui/FieldError';

export default function CapacityFields({ form, errors, change }: SectionProps) {
    return <>
        <div className="grid grid-cols-2 gap-4">{CAPACITY_FIELDS.map(({ key, label }) => <label key={key}>{label}<input className={field} aria-invalid={!!errors[key]} type="number" step={1} value={form[key]} onChange={e => change(key, e.target.value)} /><FieldError message={errors[key]} /></label>)}</div>
        <div className="grid grid-cols-2 gap-4"><label>Precio por noche<input className={field} aria-invalid={!!errors.price} type="number" step="0.01" value={form.price} onChange={e => change('price', e.target.value)} /><FieldError message={errors.price} /></label><label>Moneda<select className={field} aria-invalid={!!errors.currency} value={form.currency} onChange={e => change('currency', e.target.value)}>{CURRENCIES.map(currency => <option key={currency}>{currency}</option>)}</select><FieldError message={errors.currency} /></label></div>
        <div className="grid grid-cols-2 gap-4"><label>Hora de entrada<input className={field} aria-invalid={!!errors.check_in_time} type="time" value={form.check_in_time} onChange={e => change('check_in_time', e.target.value)} /><FieldError message={errors.check_in_time} /></label><label>Hora de salida<input className={field} aria-invalid={!!errors.check_out_time} type="time" value={form.check_out_time} onChange={e => change('check_out_time', e.target.value)} /><FieldError message={errors.check_out_time} /></label></div>
    </>;
}
