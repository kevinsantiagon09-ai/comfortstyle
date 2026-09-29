import type { PropertyEditTabsProps } from '../../types/propertyForm';

export default function PropertyEditTabs({ steps, tabProps, tabsWithErrors }: PropertyEditTabsProps) {
    return <div role="tablist" aria-label="Secciones del alojamiento" className="grid grid-cols-5 gap-2 pb-1">
        {steps.map(({ label }, index) => {
            const props = tabProps(index);
            const hasError = tabsWithErrors.includes(index);
            return <button key={label} {...props} className={`inline-flex items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-white ring-1 ring-white/10 transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:text-sm ${props['aria-selected'] ? 'bg-linear-to-r from-blue-700 to-indigo-600 shadow-lg shadow-blue-500/40' : 'bg-linear-to-r from-slate-900 via-blue-950 to-blue-900 shadow-md shadow-slate-900/30 hover:-translate-y-0.5 hover:to-indigo-800'}`}>
                {label}
                {hasError && <><span aria-hidden="true" className="h-2 w-2 rounded-full bg-red-600" /><span className="sr-only">(con errores)</span></>}
            </button>;
        })}
    </div>;
}
