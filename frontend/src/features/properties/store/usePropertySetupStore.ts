import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const initialSetupForm = {
    name: '', description: '', property_type: 'Casa', address: '', departmentId: '', cityId: '',
    max_guests: '2', bathrooms: '1', bedrooms: '1', beds: '1', price: '', currency: 'COP',
    check_in_time: '15:00', check_out_time: '11:00',
};

export const LAST_STEP = 3;

export type SetupForm = typeof initialSetupForm;
export type SetupField = keyof SetupForm;

interface PropertySetupState {
    step: number;
    form: SetupForm;
    setField: (key: SetupField, value: string) => void;
    next: () => void;
    back: () => void;
    goTo: (step: number) => void;
    reset: () => void;
}

/**
 * Avance del asistente antes de registrar el alojamiento. Se guarda en este navegador
 * para no perderlo al recargar (salvo las fotos); se limpia al registrarlo o al cerrar sesión.
 */
export const usePropertySetupStore = create<PropertySetupState>()(
    persist(
        (set) => ({
            step: 0,
            form: initialSetupForm,
            setField: (key, value) => set((state) => ({
                form: { ...state.form, [key]: value, ...(key === 'departmentId' ? { cityId: '' } : {}) },
            })),
            next: () => set((state) => ({ step: Math.min(state.step + 1, LAST_STEP) })),
            goTo: (step) => set({ step: Math.min(Math.max(step, 0), LAST_STEP) }),
            back: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),
            reset: () => set({ step: 0, form: initialSetupForm }),
        }),
        {
            name: 'comfortstyle:property-setup',
            version: 1,
            storage: createJSONStorage(() => localStorage),
            partialize: ({ step, form }) => ({ step, form }),
            merge: (persisted, current) => {
                const saved = persisted as Partial<Pick<PropertySetupState, 'step' | 'form'>> | undefined;
                return { ...current, step: saved?.step ?? 0, form: { ...initialSetupForm, ...saved?.form } };
            },
        }
    )
);

export const hasSetupProgress = (state: Pick<PropertySetupState, 'step' | 'form'>) =>
    state.step > 0 || state.form.name.trim() !== '' || state.form.description.trim() !== '';

export function clearPropertySetup() {
    usePropertySetupStore.getState().reset();
    usePropertySetupStore.persist.clearStorage();
}
