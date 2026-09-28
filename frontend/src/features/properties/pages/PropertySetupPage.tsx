import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty, validatePropertyFields, type PropertyInput } from '../api/hostProperties.api';
import { propertyKeys } from '../api/queryKeys';
import { useLocations } from '../hooks/useLocations';
import { apiError, fieldErrors } from '../utils/apiError';
import PropertyPhotosStep from '../components/PropertyPhotosStep';
import PropertyPhotoPicker from '../components/PropertyPhotoPicker';
import { clearPropertySetup, LAST_STEP, usePropertySetupStore, type SetupField, type SetupForm } from '../store/usePropertySetupStore';

const field = 'mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100';
const button = 'rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50';
const steps = ['Tu alojamiento', 'Ubicación', 'Capacidad y precio', 'Fotografías'];
/** Campos que el backend valida en cada paso; el último paso son las fotos. */
const stepFields: (keyof PropertyInput | 'images')[][] = [
    ['name', 'property_type', 'description'],
    ['city_id', 'address'],
    ['max_guests', 'bedrooms', 'beds', 'bathrooms', 'price', 'currency', 'check_in_time', 'check_out_time'],
    ['images'],
];
/** Nombre del campo en el backend → campo del formulario, cuando difieren. */
const formField: Partial<Record<string, SetupField>> = { city_id: 'cityId' };

const toInput = (form: SetupForm): PropertyInput => ({
    name: form.name.trim(), description: form.description.trim(), property_type: form.property_type,
    address: form.address.trim(), city_id: form.cityId, max_guests: form.max_guests,
    bathrooms: form.bathrooms, bedrooms: form.bedrooms, beds: form.beds,
    price: form.price, currency: form.currency,
    check_in_time: form.check_in_time || null, check_out_time: form.check_out_time || null,
});

const without = (errors: Record<string, string>, key: string) => Object.fromEntries(Object.entries(errors).filter(([name]) => name !== key));

function FieldError({ message }: { message?: string }) {
    return message ? <span role="alert" className="mt-1 block text-sm text-red-700">{message}</span> : null;
}

export default function PropertySetupPage() {
    const [params, setParams] = useSearchParams();
    const rawId = params.get('property');
    const propertyId = rawId === null ? null : Number(rawId);
    const { step, form, setField, next, back, goTo } = usePropertySetupStore();
    const { departments, cities } = useLocations(form.departmentId);
    const client = useQueryClient();
    const [photos, setPhotos] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validation = useMutation({
        mutationFn: (fields: (keyof PropertyInput)[]) => validatePropertyFields(toInput(form), fields),
        onSuccess: () => { setErrors({}); next(); },
        onError: (error) => setErrors(fieldErrors(error)),
    });
    const registration = useMutation({
        mutationFn: () => createProperty(toInput(form), photos),
        onSuccess: (property) => {
            client.setQueryData(propertyKeys.hostDetail(property.id), property);
            void client.invalidateQueries({ queryKey: propertyKeys.hostAll });
            void client.invalidateQueries({ queryKey: ['properties', 'public'] });
            clearPropertySetup();
            setPhotos([]);
            setParams({ property: String(property.id) }, { replace: true });
        },
        onError: (error) => {
            const found = fieldErrors(error);
            setErrors(found);
            // Lleva al anfitrión al primer paso que tenga un error del backend.
            const firstStep = stepFields.findIndex((fields) => fields.some((name) => name in found));
            if (firstStep >= 0 && firstStep !== step) goTo(firstStep);
        },
    });
    const busy = validation.isPending || registration.isPending;
    const requestError = validation.error ?? registration.error;
    const showRequestError = requestError !== null && Object.keys(fieldErrors(requestError)).length === 0;

    const change = (key: SetupField, value: string) => {
        setField(key, value);
        const backendKey = Object.keys(formField).find((name) => formField[name] === key) ?? key;
        if (errors[backendKey]) setErrors((current) => without(current, backendKey));
    };
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        if (step < LAST_STEP) { validation.mutate(stepFields[step] as (keyof PropertyInput)[]); return; }
        if (photos.length === 0) { setErrors({ images: 'Agrega al menos una fotografía del alojamiento.' }); return; }
        registration.mutate();
    };

    if (propertyId !== null && (!Number.isSafeInteger(propertyId) || propertyId <= 0)) return <p role="alert">El alojamiento seleccionado no es válido. <Link to="/host">Volver al panel</Link></p>;
    const activeStep = propertyId ? LAST_STEP : step;
    return <section className="mx-auto max-w-3xl">
        <Link to="/host" className="text-sm font-medium text-blue-700">← Mis alojamientos</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-700">Comienza a recibir huéspedes</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Configuremos tu alojamiento</h1>
        <p className="mt-3 text-slate-600">Completa los pasos y registra tu alojamiento listo para recibir huéspedes.</p>
        <ol aria-label="Progreso de configuración" className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{steps.map((label, index) => <li key={label} aria-current={activeStep === index ? 'step' : undefined} className={`rounded-xl border p-3 text-sm ${index === activeStep ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-500'}`}><span className="mb-1 block font-bold">{index + 1}</span>{label}</li>)}</ol>
        {propertyId ? <PropertyPhotosStep key={propertyId} propertyId={propertyId} /> : <form onSubmit={submit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <fieldset disabled={busy} className="space-y-5">
                <legend className="mb-5 text-xl font-semibold">{steps[step]}</legend>
                {step === 0 && <>
                    <label className="block">Nombre del alojamiento<input autoFocus className={field} aria-invalid={!!errors.name} maxLength={150} value={form.name} onChange={e => change('name', e.target.value)} placeholder="Una casa tranquila cerca del centro" /><FieldError message={errors.name} /></label>
                    <label className="block">Tipo de alojamiento<select className={field} aria-invalid={!!errors.property_type} value={form.property_type} onChange={e => change('property_type', e.target.value)}>{['Casa', 'Apartamento', 'Cabaña', 'Habitación', 'Finca'].map(type => <option key={type}>{type}</option>)}</select><FieldError message={errors.property_type} /></label>
                    <label className="block">Descripción<textarea className={field} aria-invalid={!!errors.description} maxLength={3000} rows={5} value={form.description} onChange={e => change('description', e.target.value)} placeholder="Cuéntales a tus huéspedes qué hace especial este lugar." /><FieldError message={errors.description} /></label>
                </>}
                {step === 1 && <>
                    <label className="block">Departamento<select className={field} value={form.departmentId} onChange={e => change('departmentId', e.target.value)} disabled={departments.isPending || departments.isError}><option value="">{departments.isPending ? 'Cargando departamentos…' : 'Selecciona un departamento'}</option>{departments.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
                    {departments.isError && <p role="alert">No pudimos cargar los departamentos. <button type="button" onClick={() => void departments.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
                    <label className="block">Ciudad o municipio<select className={field} aria-invalid={!!errors.city_id} value={form.cityId} onChange={e => change('cityId', e.target.value)} disabled={!form.departmentId || cities.isPending || cities.isError}><option value="">{form.departmentId && cities.isPending ? 'Cargando ciudades…' : 'Selecciona una ciudad'}</option>{cities.data?.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><FieldError message={errors.city_id} /></label>
                    {cities.isError && <p role="alert">No pudimos cargar las ciudades. <button type="button" onClick={() => void cities.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
                    {form.departmentId && cities.isSuccess && cities.data.length === 0 && <p role="status">Este departamento todavía no tiene ciudades disponibles.</p>}
                    <label className="block">Dirección<input className={field} aria-invalid={!!errors.address} maxLength={255} autoComplete="street-address" value={form.address} onChange={e => change('address', e.target.value)} /><FieldError message={errors.address} /></label>
                </>}
                {step === 2 && <>
                    <div className="grid grid-cols-2 gap-4">{([['max_guests', 'Huéspedes'], ['bedrooms', 'Habitaciones'], ['beds', 'Camas'], ['bathrooms', 'Baños']] as const).map(([key, label]) => <label key={key}>{label}<input className={field} aria-invalid={!!errors[key]} type="number" step={1} value={form[key]} onChange={e => change(key, e.target.value)} /><FieldError message={errors[key]} /></label>)}</div>
                    <div className="grid grid-cols-2 gap-4"><label>Precio por noche<input className={field} aria-invalid={!!errors.price} type="number" step="0.01" value={form.price} onChange={e => change('price', e.target.value)} /><FieldError message={errors.price} /></label><label>Moneda<select className={field} aria-invalid={!!errors.currency} value={form.currency} onChange={e => change('currency', e.target.value)}>{['COP', 'USD', 'EUR'].map(currency => <option key={currency}>{currency}</option>)}</select><FieldError message={errors.currency} /></label></div>
                    <div className="grid grid-cols-2 gap-4"><label>Hora de entrada<input className={field} aria-invalid={!!errors.check_in_time} type="time" value={form.check_in_time} onChange={e => change('check_in_time', e.target.value)} /><FieldError message={errors.check_in_time} /></label><label>Hora de salida<input className={field} aria-invalid={!!errors.check_out_time} type="time" value={form.check_out_time} onChange={e => change('check_out_time', e.target.value)} /><FieldError message={errors.check_out_time} /></label></div>
                </>}
                {step === 3 && <>
                    <PropertyPhotoPicker files={photos} onChange={(files) => { setPhotos(files); setErrors((current) => without(current, 'images')); }} disabled={busy} error={errors.images} />
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Al registrar, tu alojamiento quedará publicado con estas fotografías.</p>
                </>}
            </fieldset>
            {showRequestError && <p role="alert" className="mt-4 text-red-700">{apiError(requestError)}</p>}
            <div className="mt-8 flex items-center justify-between gap-4"><button type="button" disabled={step === 0 || busy} onClick={() => { validation.reset(); registration.reset(); setErrors({}); back(); }} className="rounded-xl border px-5 py-3 disabled:opacity-40">Anterior</button><button className={button} disabled={busy || (step === 1 && (cities.isError || departments.isError))}>{validation.isPending ? 'Validando…' : registration.isPending ? 'Registrando…' : step === LAST_STEP ? 'Registrar alojamiento' : 'Continuar'}</button></div>
            <p className="mt-4 text-xs text-slate-500">Tu avance se conserva en este navegador aunque recargues la página (las fotos deberás elegirlas de nuevo).</p>
        </form>}
    </section>;
}
