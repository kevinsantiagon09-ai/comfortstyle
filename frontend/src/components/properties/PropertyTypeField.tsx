import { Check, ChevronDown, Pencil, Plus } from 'lucide-react';
import { FORM_FIELD_CLASS as field, FORM_HINT_CLASS as hint, FORM_LABEL_CLASS as label } from '../../constants/styles';
import { usePropertyTypeField } from '../../hooks/propertyTypes/usePropertyTypeField';
import type { PropertyTypeFieldProps } from '../../types/propertyType';
import FieldError from '../ui/FieldError';

export default function PropertyTypeField({ value, error, onChange }: PropertyTypeFieldProps) {
    const typeField = usePropertyTypeField({ value, onChange });
    const { types } = typeField;
    const editing = typeField.mode !== 'closed';

    return <div>
        <div className="flex items-center justify-between gap-3">
            <label htmlFor="property-type" className={label}>Tipo de alojamiento</label>
            {!editing && <button type="button" onClick={typeField.openCreate} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                <Plus aria-hidden="true" className="h-4 w-4" />Nuevo tipo
            </button>}
        </div>

        <div className="relative">
            <select id="property-type" className={`${field} appearance-none pr-11`} aria-invalid={!!error} disabled={types.isPending || editing} value={value} onChange={e => onChange(e.target.value)}>
                <option value="" disabled>{types.isPending ? 'Cargando tipos…' : types.isError ? 'No pudimos cargar los tipos' : 'Selecciona un tipo'}</option>
                <optgroup label="Tipos generales">
                    {typeField.globalTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </optgroup>
                {typeField.ownTypes.length > 0 && <optgroup label="Mis tipos">
                    {typeField.ownTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                </optgroup>}
            </select>
            <span className="pointer-events-none absolute inset-y-0 top-2 right-4 flex items-center text-slate-400"><ChevronDown aria-hidden="true" className="h-5 w-5" /></span>
        </div>
        <FieldError message={error} />
        {types.isError && <p role="alert" className="mt-1 text-sm text-red-700">No pudimos cargar los tipos. <button type="button" onClick={() => void types.refetch()} className="font-semibold underline">Reintentar</button></p>}

        {!editing && typeField.canEdit && <p className={hint}>
            <span>Este tipo lo creaste tú y solo aparece en tu lista.</span>
            <button type="button" onClick={typeField.openEdit} className="inline-flex shrink-0 items-center gap-1 font-semibold text-blue-700 hover:underline"><Pencil aria-hidden="true" className="h-3.5 w-3.5" />Cambiar nombre</button>
        </p>}

        {editing && <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:p-5">
            <label htmlFor="property-type-name" className={label}>{typeField.mode === 'create' ? 'Nuevo tipo de alojamiento' : 'Cambiar nombre del tipo'}</label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <input id="property-type-name" autoFocus className={`${field} sm:flex-1`} aria-invalid={!!typeField.error} maxLength={50} value={typeField.draft} onChange={e => typeField.changeDraft(e.target.value)} onKeyDown={typeField.handleKeyDown} placeholder="Ej. Casa campestre, Glamping, Chalet" />
                <div className="flex gap-2 sm:mt-2">
                    <button type="button" onClick={typeField.close} className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none">Cancelar</button>
                    <button type="button" onClick={typeField.save} disabled={typeField.isSaving || !typeField.draft.trim()} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 sm:flex-none">
                        <Check aria-hidden="true" className="h-4 w-4" />{typeField.isSaving ? 'Guardando…' : 'Guardar'}
                    </button>
                </div>
            </div>
            <FieldError message={typeField.error} />
            <p className={hint}><span>Solo tú lo verás en tu lista de tipos. Los huéspedes lo verán en tu alojamiento.</span><span className="tabular-nums">{typeField.draft.length}/50</span></p>
        </div>}
    </div>;
}
