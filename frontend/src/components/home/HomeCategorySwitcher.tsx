import { HOME_CATEGORIES } from '../../constants/home';
import type { HomeCategorySwitcherProps } from '../../types/home';

/** Selector en tarjetas: cada categoría muestra su descripción y su estado, no solo un ícono. */
export default function HomeCategorySwitcher({ active, onSelect, propertyCount }: HomeCategorySwitcherProps) {
    return <div role="tablist" aria-label="Qué quieres ver" className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {HOME_CATEGORIES.map(({ id, label, description, icon: Icon, soon }) => {
            const selected = id === active;
            const count = id === 'hospedajes' ? propertyCount : null;

            return <button key={id} type="button" role="tab" aria-selected={selected} onClick={() => onSelect(id)}
                className={`group relative flex min-w-[15rem] snap-start items-center gap-4 rounded-2xl border p-4 text-left transition sm:min-w-0 ${selected ? 'border-transparent bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'}`}>
                <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition ${selected ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700'}`}>
                    <Icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <span className="min-w-0">
                    <span className="flex items-center gap-2 text-base font-extrabold">
                        {label}
                        {count !== null && <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? 'bg-white/15' : 'bg-slate-100 text-slate-600'}`}>{count}</span>}
                        {soon && <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-white uppercase">Pronto</span>}
                    </span>
                    <span className={`mt-0.5 block truncate text-sm ${selected ? 'text-white/70' : 'text-slate-500'}`}>{description}</span>
                </span>
            </button>;
        })}
    </div>;
}
