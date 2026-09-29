import { CircleCheck } from 'lucide-react';
import { SETUP_STEPS } from '../../constants/propertySetup';
import type { SetupProgressProps } from '../../types/propertyForm';

export default function SetupProgress({ activeStep }: SetupProgressProps) {
    return <ol aria-label="Progreso de configuración" className="my-8 grid grid-cols-2 gap-3 sm:grid-cols-5">{SETUP_STEPS.map(({ label, icon: Icon }, index) => {
        const done = index < activeStep;
        return <li key={label} aria-current={activeStep === index ? 'step' : undefined} className={`rounded-xl border p-3 text-sm ${index === activeStep ? 'border-blue-600 bg-blue-50 text-blue-800' : done ? 'border-green-200 bg-green-50 text-green-800' : 'border-slate-200 text-slate-500'}`}>
            <span className="mb-1 flex items-center justify-between font-bold">{index + 1}{done ? <CircleCheck aria-label="Completado" className="h-5 w-5" /> : <Icon aria-hidden="true" className="h-5 w-5" />}</span>{label}
        </li>;
    })}</ol>;
}
