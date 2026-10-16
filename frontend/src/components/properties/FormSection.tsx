import type { FormSectionProps } from '../../types/propertyForm';

/** Las etiquetas de cada campo comparten estilo: texto pequeño y semibold sobre el control. */
export default function FormSection({ step, children }: FormSectionProps) {
    const Icon = step.icon;
    return <fieldset className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 [&>div>label]:text-sm [&>div>label]:font-semibold [&>div>label]:text-slate-800 [&>label]:text-sm [&>label]:font-semibold [&>label]:text-slate-800">
        <legend className="sr-only">{step.label}</legend>
        <h2 aria-hidden="true" className="flex items-center gap-3 border-b border-slate-100 pb-5 text-xl font-bold text-slate-900">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span>
            <span>{step.label}</span>
        </h2>
        {children}
    </fieldset>;
}
