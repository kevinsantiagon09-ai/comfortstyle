import { FORM_FIELD_CLASS as field } from '../../constants/styles';
import { useLocations } from '../../hooks/locations/useLocations';
import type { SectionProps } from '../../types/propertyForm';
import LocationMapField from '../map/LocationMapField';
import FieldError from '../ui/FieldError';

export default function LocationFields({ form, errors, change }: SectionProps) {
    const { departments, cities } = useLocations(form.departmentId);
    return <>
        <label className="block">Departamento<select className={field} value={form.departmentId} onChange={e => change('departmentId', e.target.value)} disabled={departments.isPending || departments.isError}><option value="">{departments.isPending ? 'Cargando departamentos…' : 'Selecciona un departamento'}</option>{departments.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        {departments.isError && <p role="alert">No pudimos cargar los departamentos. <button type="button" onClick={() => void departments.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
        <label className="block">Ciudad o municipio<select className={field} aria-invalid={!!errors.city_id} value={form.cityId} onChange={e => change('cityId', e.target.value)} disabled={!form.departmentId || cities.isPending || cities.isError}><option value="">{form.departmentId && cities.isPending ? 'Cargando ciudades…' : 'Selecciona una ciudad'}</option>{cities.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><FieldError message={errors.city_id} /></label>
        {cities.isError && <p role="alert">No pudimos cargar las ciudades. <button type="button" onClick={() => void cities.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
        {form.departmentId && cities.isSuccess && cities.data.length === 0 && <p role="status">Este departamento todavía no tiene ciudades disponibles.</p>}
        <label className="block">Dirección<input className={field} aria-invalid={!!errors.address} maxLength={255} autoComplete="street-address" value={form.address} onChange={e => change('address', e.target.value)} /><FieldError message={errors.address} /></label>
        <LocationMapField latitude={form.latitude} longitude={form.longitude} onChange={(latitude, longitude) => { change('latitude', latitude); change('longitude', longitude); }} error={errors.latitude ?? errors.longitude} />
    </>;
}
