import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { INITIAL_SETUP_FORM, LAST_STEP, SETUP_STORAGE_KEY } from '../constants/propertySetup';
import type { PropertySetupState } from '../types/propertyForm';
import { applyFieldChange, toggleId } from '../utils/propertyForm';

/**
 * Avance del asistente antes de registrar el alojamiento. Es estado del navegador, no del servidor,
 * por eso vive aquí y no en React Query. Se guarda para no perderlo al recargar (salvo las fotos)
 * y se limpia al registrarlo o al cerrar sesión.
 */
export const usePropertySetupStore = create<PropertySetupState>()(
    persist(
        (set) => ({
            step: 0,
            form: INITIAL_SETUP_FORM,
            setField: (key, value) => set((state) => ({ form: applyFieldChange(state.form, key, value) })),
            toggleAmenity: (id) => set((state) => ({ form: { ...state.form, amenities: toggleId(state.form.amenities, id) } })),
            next: () => set((state) => ({ step: Math.min(state.step + 1, LAST_STEP) })),
            goTo: (step) => set({ step: Math.min(Math.max(step, 0), LAST_STEP) }),
            back: () => set((state) => ({ step: Math.max(state.step - 1, 0) })),
            reset: () => set({ step: 0, form: INITIAL_SETUP_FORM }),
        }),
        {
            name: SETUP_STORAGE_KEY,
            version: 1,
            storage: createJSONStorage(() => localStorage),
            partialize: ({ step, form }) => ({ step, form }),
            merge: (persisted, current) => {
                const saved = persisted as Partial<Pick<PropertySetupState, 'step' | 'form'>> | undefined;
                return { ...current, step: saved?.step ?? 0, form: { ...INITIAL_SETUP_FORM, ...saved?.form, amenities: Array.isArray(saved?.form?.amenities) ? saved.form.amenities : [] } };
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
