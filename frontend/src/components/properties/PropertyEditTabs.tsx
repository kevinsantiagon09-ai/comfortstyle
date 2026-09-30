import type { PropertyEditTabsProps } from '../../types/propertyForm';

/** Pestañas con icono y subrayado; en pantallas angostas se desplazan en horizontal en lugar de apretarse. */
export default function PropertyEditTabs({ steps, tabProps, tabsWithErrors }: PropertyEditTabsProps) {
    return <div role="tablist" aria-label="Secciones del alojamiento" className="-mx-1 flex gap-1 overflow-x-auto border-b border-slate-200 px-1">
        {steps.map(({ label, icon: Icon }, index) => {
            const props = tabProps(index);
            const selected = props['aria-selected'];
            const hasError = tabsWithErrors.includes(index);
            return <button key={label} {...props} className={`relative -mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-500 ${selected ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'}`}>
                <Icon aria-hidden="true" className="h-4 w-4" />
                {label}
                {hasError && <><span aria-hidden="true" className="h-2 w-2 rounded-full bg-red-600" /><span className="sr-only">(con errores)</span></>}
            </button>;
        })}
    </div>;
}
