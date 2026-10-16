import { Eye, EyeOff } from 'lucide-react';
import { usePropertyVisibility } from '../../hooks/properties/usePropertyVisibility';
import type { PropertyVisibilityToggleProps } from '../../types/property';

export default function PropertyVisibilityToggle({ property }: PropertyVisibilityToggleProps) {
    const { isActive, pending, toggle, error } = usePropertyVisibility(property);
    const Icon = isActive ? Eye : EyeOff;

    return <div className={`flex items-start gap-4 rounded-2xl border p-4 sm:items-center sm:p-5 ${isActive ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}>
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
            <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
            <p id="visibility-label" className="font-semibold text-slate-900">{isActive ? 'Publicado' : 'Oculto'}</p>
            <p id="visibility-help" className="mt-0.5 text-sm text-slate-600">{isActive
                ? 'Los huéspedes lo ven en el catálogo y en el mapa, y pueden reservarlo.'
                : 'No aparece en el catálogo ni en el mapa y no recibe reservas nuevas. Las reservas que ya tienes se mantienen.'}</p>
            {error && <p role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
        </div>
        <button type="button" role="switch" aria-checked={isActive} aria-labelledby="visibility-label" aria-describedby="visibility-help" disabled={pending} onClick={toggle}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-60 ${isActive ? 'bg-emerald-600' : 'bg-slate-300'}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>;
}
