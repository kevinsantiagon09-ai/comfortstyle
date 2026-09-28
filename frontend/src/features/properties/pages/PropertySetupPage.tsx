import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty, validatePropertyFields, type PropertyInput } from '../api/hostProperties.api';
import { propertyKeys } from '../api/queryKeys';
import { useLocations } from '../hooks/useLocations';
import { apiError, fieldErrors } from '../utils/apiError';
import { backendField, toInput, without } from '../utils/propertyForm';
import PropertyPhotosStep from '../components/PropertyPhotosStep';
import PropertyPhotoPicker from '../components/PropertyPhotoPicker';
import PropertyAmenitiesPicker from '../components/PropertyAmenitiesPicker';
import { CapacityFields, DetailsFields, LocationFields } from '../components/PropertyFormSections';
import { setupSteps } from '../utils/setupSteps';
import { clearPropertySetup, LAST_STEP, usePropertySetupStore, type SetupField } from '../store/usePropertySetupStore';

const button = 'rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50';
/** Paso de las fotos: se validan en el navegador porque solo se envían al registrar. */
const PHOTOS_STEP = 3;
/** Campos que el backend valida en cada paso. */
const stepFields: (keyof PropertyInput | 'images')[][] = [
    ['name', 'property_type', 'description'],
    ['city_id', 'address'],
    ['max_guests', 'bedrooms', 'beds', 'bathrooms', 'price', 'currency', 'check_in_time', 'check_out_time'],
    ['images'],
    ['amenities'],
];
export default function PropertySetupPage() {
    const [params, setParams] = useSearchParams();
    const rawId = params.get('property');
    const propertyId = rawId === null ? null : Number(rawId);
    const { step, form, setField, toggleAmenity, next, back, goTo } = usePropertySetupStore();
    const { departments, cities } = useLocations(form.departmentId);
    const client = useQueryClient();
    const [photos, setPhotos] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const change = (key: SetupField, value: string) => {
        setField(key, value);
        const backendKey = backendField(key);
        if (errors[backendKey]) setErrors((current) => without(current, backendKey));
    };

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

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (busy) return;
        // Las fotos no sobreviven a una recarga: si faltan, se vuelve a su paso antes de registrar.
        if (step >= PHOTOS_STEP && photos.length === 0) { setErrors({ images: 'Agrega al menos una fotografía del alojamiento.' }); goTo(PHOTOS_STEP); return; }
        if (step === PHOTOS_STEP) { setErrors({}); next(); return; }
        if (step < LAST_STEP) { validation.mutate(stepFields[step] as (keyof PropertyInput)[]); return; }
        registration.mutate();
    };

    if (propertyId !== null && (!Number.isSafeInteger(propertyId) || propertyId <= 0)) return <p role="alert">El alojamiento seleccionado no es válido. <Link to="/host">Volver al panel</Link></p>;
    const activeStep = propertyId ? PHOTOS_STEP : step;
    const StepIcon = setupSteps[step].icon;
    return <section className="mx-auto max-w-3xl">
        <Link to="/host" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>
        <p className="mt-8 text-sm font-semibold uppercase tracking-widest text-blue-700">Comienza a recibir huéspedes</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Configuremos tu alojamiento</h1>
        <p className="mt-3 text-slate-600">Completa los pasos y registra tu alojamiento listo para recibir huéspedes.</p>
        <ol aria-label="Progreso de configuración" className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-5">{setupSteps.map(({ label, icon: Icon }, index) => {
            const done = index < activeStep;
            return <li key={label} aria-current={activeStep === index ? 'step' : undefined} className={`rounded-xl border p-3 text-sm ${index === activeStep ? 'border-blue-600 bg-blue-50 text-blue-800' : done ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 text-slate-500'}`}>
                <span className="mb-1 flex items-center justify-between font-bold">{index + 1}{done ? <CircleCheck aria-label="Completado" className="h-5 w-5" /> : <Icon aria-hidden="true" className="h-5 w-5" />}</span>{label}
            </li>;
        })}</ol>
        {propertyId ? <PropertyPhotosStep key={propertyId} propertyId={propertyId} /> : <form onSubmit={submit} noValidate className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <fieldset disabled={busy} className="space-y-5">
                <legend className="mb-5 flex items-center gap-2 text-xl font-semibold"><StepIcon aria-hidden="true" className="h-6 w-6 text-blue-700" />{setupSteps[step].label}</legend>
                {step === 0 && <DetailsFields form={form} errors={errors} change={change} autoFocus />}
                {step === 1 && <LocationFields form={form} errors={errors} change={change} />}
                {step === 2 && <CapacityFields form={form} errors={errors} change={change} />}
                {step === PHOTOS_STEP && <PropertyPhotoPicker files={photos} onChange={(files) => { setPhotos(files); setErrors((current) => without(current, 'images')); }} disabled={busy} error={errors.images} />}
                {step === 4 && <>
                    <PropertyAmenitiesPicker selected={form.amenities} onToggle={(id) => { toggleAmenity(id); setErrors((current) => without(current, 'amenities')); }} disabled={busy} error={errors.amenities} />
                    <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Al registrar, tu alojamiento quedará publicado con tus fotografías y comodidades.</p>
                </>}
            </fieldset>
            {showRequestError && <p role="alert" className="mt-4 text-red-700">{apiError(requestError)}</p>}
            <div className="mt-8 flex items-center justify-between gap-4"><button type="button" disabled={step === 0 || busy} onClick={() => { validation.reset(); registration.reset(); setErrors({}); back(); }} className="rounded-xl border px-5 py-3 disabled:opacity-40">Anterior</button><button className={button} disabled={busy || (step === 1 && (cities.isError || departments.isError))}>{validation.isPending ? 'Validando…' : registration.isPending ? 'Registrando…' : step === LAST_STEP ? 'Registrar alojamiento' : 'Continuar'}</button></div>
            <p className="mt-4 text-xs text-slate-500">Tu avance se conserva en este navegador aunque recargues la página (las fotos deberás elegirlas de nuevo).</p>
        </form>}
    </section>;
}
