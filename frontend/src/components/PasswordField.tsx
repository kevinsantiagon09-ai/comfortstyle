import { usePasswordField } from '../hooks/usePasswordField';

type PasswordFieldProps = {
    label: string;
    name: string;
    autoComplete: 'new-password' | 'current-password';
    minLength?: number;
};

export default function PasswordField({ label, name, autoComplete, minLength }: PasswordFieldProps) {
    const { id, visible, inputType, action, toggleVisibility } = usePasswordField(label);

    return <div>
        <label htmlFor={id} className="block">{label}</label>
        <div className="relative mt-1">
            <input id={id} className="w-full rounded-lg border border-slate-300 py-2 pl-3 pr-12" name={name} type={inputType} autoComplete={autoComplete} required minLength={minLength} />
            <button type="button" onClick={toggleVisibility} aria-label={action} aria-controls={id} title={action}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-600 hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                    {visible && <path d="m3 3 18 18" />}
                </svg>
            </button>
        </div>
    </div>;
}
