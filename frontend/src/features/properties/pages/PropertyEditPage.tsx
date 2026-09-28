import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Save } from 'lucide-react';
import type { Property } from '../../../types/property';
import PropertyAmenitiesPicker from '../components/PropertyAmenitiesPicker';
import { CapacityFields, DetailsFields, LocationFields } from '../components/PropertyFormSections';
import { setupSteps } from '../utils/setupSteps';
import { useHostProperty, useUpdateProperty } from '../hooks/useHostProperties';
import type { SetupField, SetupForm } from '../store/usePropertySetupStore';
import { apiError, fieldErrors } from '../utils/apiError';
import { backendField, fromProperty, toInput, without } from '../utils/propertyForm';

/** Secciones editables, en el mismo orden y con los mismos iconos que el registro (las fotos se editan aparte). */
const [details, location, capacity, photos, amenities] = setupSteps;

function Section({ step, children }: { step: typeof details; children: ReactNode }) {
    const Icon = step.icon;
    return <fieldset className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <legend className="sr-only">{step.label}</legend>
        <h2 aria-hidden="true" className="flex items-center gap-2 text-xl font-semibold"><Icon className="h-6 w-6 text-blue-700" />{step.label}</h2>
        {children}
    </fieldset>;
}

function EditForm({ property }: { property: Property }) {
    const navigate = useNavigate();
    const update = useUpdateProperty(property.id);
    const [form, setForm] = useState<SetupForm>(() => fromProperty(property));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const change = (key: SetupField, value: string) => {
        setForm((current) => ({ ...current, [key]: value, ...(key === 'departmentId' ? { cityId: '' } : {}) }));
        const backendKey = backendField(key);
        if (errors[backendKey]) setErrors((current) => without(current, backendKey));
    };
    const toggleAmenity = (id: number) => {
        setForm((current) => ({ ...current, amenities: current.amenities.includes(id) ? current.amenities.filter((item) => item !== id) : [...current.amenities, id] }));
        setErrors((current) => without(current, 'amenities'));
    };
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (update.isPending) return;
        update.mutate(toInput(form), {
            onSuccess: () => navigate('/host'),
            onError: (error) => setErrors(fieldErrors(error)),
        });
    };
    const showRequestError = update.error !== null && Object.keys(fieldErrors(update.error)).length === 0;
    const sectionProps = { form, errors, change };

    return <form onSubmit={submit} noValidate className="space-y-6">
        <Section step={details}><DetailsFields {...sectionProps} /></Section>
        <Section step={location}><LocationFields {...sectionProps} /></Section>
        <Section step={capacity}><CapacityFields {...sectionProps} /></Section>
        <Section step={amenities}><PropertyAmenitiesPicker selected={form.amenities} onToggle={toggleAmenity} disabled={update.isPending} error={errors.amenities} /></Section>

        <Link to={`/host/setup?property=${property.id}`} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 font-medium text-blue-700 shadow-sm hover:border-blue-300">
            <photos.icon aria-hidden="true" className="h-6 w-6" />Gestionar fotografías
        </Link>

        {Object.keys(errors).length > 0 && <p role="alert" className="text-red-700">Revisa los campos marcados.</p>}
        {showRequestError && <p role="alert" className="text-red-700">{apiError(update.error)}</p>}
        <div className="flex items-center justify-between gap-4">
            <Link to="/host" className="rounded-xl border px-5 py-3">Cancelar</Link>
            <button disabled={update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50">
                <Save aria-hidden="true" className="h-5 w-5" />{update.isPending ? 'Guardando…' : 'Guardar cambios'}
            </button>
        </div>
    </form>;
}

export default function PropertyEditPage() {
    const id = Number(useParams().id);
    const valid = Number.isSafeInteger(id) && id > 0;
    const property = useHostProperty(valid ? id : 0);

    return <section className="mx-auto max-w-3xl">
        <Link to="/host" className="inline-flex items-center gap-1 text-sm font-medium text-blue-700"><ArrowLeft aria-hidden="true" className="h-4 w-4" />Mis alojamientos</Link>
        <h1 className="mt-8 text-3xl font-bold text-slate-900">Editar alojamiento</h1>
        {!valid ? <p role="alert" className="mt-6">El alojamiento seleccionado no es válido.</p>
            : property.isPending ? <p role="status" className="mt-6">Cargando alojamiento…</p>
            : property.isError ? <p role="alert" className="mt-6">{apiError(property.error)} <button type="button" onClick={() => void property.refetch()} className="text-blue-700 underline">Reintentar</button></p>
            : <>
                <p className="mt-3 flex items-center gap-2 text-slate-600"><Pencil aria-hidden="true" className="h-4 w-4 shrink-0" />Actualiza los datos de «{property.data.name}». Los cambios se ven de inmediato en tu publicación.</p>
                <div className="mt-8"><EditForm key={property.data.id} property={property.data} /></div>
            </>}
    </section>;
}
