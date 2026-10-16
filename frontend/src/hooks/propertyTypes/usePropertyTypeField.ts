import { useState, type KeyboardEvent } from 'react';
import type { PropertyType, PropertyTypeEditorMode, PropertyTypeFieldProps } from '../../types/propertyType';
import { apiError, fieldErrors } from '../../utils/apiError';
import { useFieldErrors } from '../ui/useFieldErrors';
import { useCreatePropertyType } from './useCreatePropertyType';
import { useHostPropertyTypes } from './useHostPropertyTypes';
import { useUpdatePropertyType } from './useUpdatePropertyType';

/**
 * Selector de tipo con editor en línea: el anfitrión elige un tipo, crea uno propio
 * o renombra uno que ya creó. Los tipos globales del administrador no se pueden editar.
 */
export function usePropertyTypeField({ value, onChange }: Pick<PropertyTypeFieldProps, 'value' | 'onChange'>) {
    const types = useHostPropertyTypes();
    const create = useCreatePropertyType();
    const update = useUpdatePropertyType();
    const { errors, setErrors, clearError } = useFieldErrors();
    const [mode, setMode] = useState<PropertyTypeEditorMode>('closed');
    const [draft, setDraft] = useState('');

    const selected = types.data?.find((type) => String(type.id) === value);
    const mutation = mode === 'edit' ? update : create;
    const hasFieldErrors = Object.keys(errors).length > 0;

    const open = (next: Exclude<PropertyTypeEditorMode, 'closed'>) => {
        setMode(next);
        setDraft(next === 'edit' ? selected?.name ?? '' : '');
        setErrors({});
        create.reset();
        update.reset();
    };

    const close = () => {
        setMode('closed');
        setErrors({});
    };

    const save = () => {
        if (mutation.isPending || !draft.trim()) return;
        const data = { name: draft.trim() };
        const handlers = {
            onSuccess: (type: PropertyType) => {
                onChange(String(type.id));
                close();
            },
            onError: (error: Error) => setErrors(fieldErrors(error)),
        };
        if (mode === 'edit' && selected) update.mutate({ uuid: selected.uuid, data }, handlers);
        else create.mutate(data, handlers);
    };

    /** El editor vive dentro del formulario del alojamiento: Enter no debe enviarlo. */
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            save();
        }
        if (event.key === 'Escape') close();
    };

    return {
        types,
        /** Separados para mostrarlos en grupos: los del administrador y los que creó el anfitrión. */
        globalTypes: types.data?.filter((type) => type.user_id === null) ?? [],
        ownTypes: types.data?.filter((type) => type.user_id !== null) ?? [],
        mode,
        draft,
        changeDraft: (next: string) => {
            setDraft(next);
            clearError('name');
        },
        /** Solo los tipos propios traen dueño: la lista del anfitrión no incluye los de otros. */
        canEdit: selected?.user_id != null,
        selectedName: selected?.name ?? '',
        openCreate: () => open('create'),
        openEdit: () => open('edit'),
        close,
        save,
        handleKeyDown,
        isSaving: mutation.isPending,
        error: errors.name ?? (mutation.isError && !hasFieldErrors ? apiError(mutation.error) : undefined),
    };
}
