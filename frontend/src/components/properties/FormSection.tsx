import type { FormSectionProps } from '../../types/propertyForm';

export default function FormSection({ step, children }: FormSectionProps) {
    const Icon = step.icon;
    return <fieldset className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <legend className="sr-only">{step.label}</legend>
        <h2 aria-hidden="true" className="flex items-center gap-2 text-xl font-semibold"><Icon className="h-6 w-6 text-blue-700" />{step.label}</h2>
        {children}
    </fieldset>;
}
