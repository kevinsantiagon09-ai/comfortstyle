import { useLocations } from '../hooks/useLocations';
import type { SetupField, SetupForm } from '../store/usePropertySetupStore';

const field = 'mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100';

export interface SectionProps {
    form: SetupForm;
    errors: Record<string, string>;
    change: (key: SetupField, value: string) => void;
}

export function FieldError({ message }: { message?: string }) {
    return message ? <span role="alert" className="mt-1 block text-sm text-red-700">{message}</span> : null;
}

export function DetailsFields({ form, errors, change, autoFocus }: SectionProps & { autoFocus?: boolean }) {
    return <>
        <label className="block">Nombre del alojamiento<input autoFocus={autoFocus} className={field} aria-invalid={!!errors.name} maxLength={150} value={form.name} onChange={e => change('name', e.target.value)} placeholder="Una casa tranquila cerca del centro" /><FieldError message={errors.name} /></label>
        <label className="block">Tipo de alojamiento<select className={field} aria-invalid={!!errors.property_type} value={form.property_type} onChange={e => change('property_type', e.target.value)}>{['Casa', 'Apartamento', 'Cabaña', 'Habitación', 'Finca'].map(type => <option key={type}>{type}</option>)}</select><FieldError message={errors.property_type} /></label>
        <label className="block">Descripción<textarea className={field} aria-invalid={!!errors.description} maxLength={3000} rows={5} value={form.description} onChange={e => change('description', e.target.value)} placeholder="Cuéntales a tus huéspedes qué hace especial este lugar." /><FieldError message={errors.description} /></label>
    </>;
}

export function LocationFields({ form, errors, change }: SectionProps) {
    const { departments, cities } = useLocations(form.departmentId);
    return <>
        <label className="block">Departamento<select className={field} value={form.departmentId} onChange={e => change('departmentId', e.target.value)} disabled={departments.isPending || departments.isError}><option value="">{departments.isPending ? 'Cargando departamentos…' : 'Selecciona un departamento'}</option>{departments.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {departments.isError && <p role="alert">No pudimos cargar los departamentos. <button type="button" onClick={() => void departments.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
        <label className="block">Ciudad o municipio<select className={field} aria-invalid={!!errors.city_id} value={form.cityId} onChange={e => change('cityId', e.target.value)} disabled={!form.departmentId || cities.isPending || cities.isError}><option value="">{form.departmentId && cities.isPending ? 'Cargando ciudades…' : 'Selecciona una ciudad'}</option>{cities.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><FieldError message={errors.city_id} /></label>
        {cities.isError && <p role="alert">No pudimos cargar las ciudades. <button type="button" onClick={() => void cities.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
        {form.departmentId && cities.isSuccess && cities.data.length === 0 && <p role="status">Este departamento todavía no tiene ciudades disponibles.</p>}
        <label className="block">Dirección<input className={field} aria-invalid={!!errors.address} maxLength={255} autoComplete="street-address" value={form.address} onChange={e => change('address', e.target.value)} /><FieldError message={errors.address} /></label>
    </>;
}

export function CapacityFields({ form, errors, change }: SectionProps) {
    return <>
        <div className="grid grid-cols-2 gap-4">{([['max_guests', 'Huéspedes'], ['bedrooms', 'Habitaciones'], ['beds', 'Camas'], ['bathrooms', 'Baños']] as const).map(([key, label]) => <label key={key}>{label}<input className={field} aria-invalid={!!errors[key]} type="number" step={1} value={form[key]} onChange={e => change(key, e.target.value)} /><FieldError message={errors[key]} /></label>)}</div>
        <div className="grid grid-cols-2 gap-4"><label>Precio por noche<input className={field} aria-invalid={!!errors.price} type="number" step="0.01" value={form.price} onChange={e => change('price', e.target.value)} /><FieldError message={errors.price} /></label><label>Moneda<select className={field} aria-invalid={!!errors.currency} value={form.currency} onChange={e => change('currency', e.target.value)}>{['COP', 'USD', 'EUR'].map(currency => <option key={currency}>{currency}</option>)}</select><FieldError message={errors.currency} /></label></div>
        <div className="grid grid-cols-2 gap-4"><label>Hora de entrada<input className={field} aria-invalid={!!errors.check_in_time} type="time" value={form.check_in_time} onChange={e => change('check_in_time', e.target.value)} /><FieldError message={errors.check_in_time} /></label><label>Hora de salida<input className={field} aria-invalid={!!errors.check_out_time} type="time" value={form.check_out_time} onChange={e => change('check_out_time', e.target.value)} /><FieldError message={errors.check_out_time} /></label></div>
    </>;
}
