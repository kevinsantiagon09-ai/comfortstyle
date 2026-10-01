import { useState, type ChangeEvent, type FormEvent } from 'react';
import { MAX_PANORAMAS } from '../../constants/panoramas';
import { apiError, fieldErrors } from '../../utils/apiError';
import { panoramaDimensionsError, panoramaFileError, readPanorama } from '../../utils/panoramas';
import { useDeletePropertyPanorama } from './useDeletePropertyPanorama';
import { usePropertyPanoramas } from './usePropertyPanoramas';
import { useUploadPropertyPanorama } from './useUploadPropertyPanorama';

/** Sección del anfitrión para armar el recorrido: valida la foto en el navegador antes de subirla. */
export function usePanoramaManager(propertyId: number) {
    const panoramas = usePropertyPanoramas(propertyId);
    const upload = useUploadPropertyPanorama(propertyId);
    const remove = useDeletePropertyPanorama(propertyId);
    /** Cambiarla vuelve a montar el campo de archivo, que así queda vacío. */
    const [fileInputKey, setFileInputKey] = useState(0);
    const [title, setTitle] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reading, setReading] = useState(false);
    const count = panoramas.data?.length ?? 0;

    const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files?.[0] ?? null;
        setError(selected ? panoramaFileError(selected) : null);
        setFile(selected);
    };

    const reset = () => {
        setTitle('');
        setFile(null);
        setFileInputKey((key) => key + 1);
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (upload.isPending || reading) return;
        if (!title.trim()) return setError('Escribe el nombre del espacio, por ejemplo «Sala».');
        if (!file) return setError('Selecciona una foto 360°.');
        const fileError = panoramaFileError(file);
        if (fileError) return setError(fileError);

        setError(null);
        setReading(true);
        try {
            const info = await readPanorama(file);
            const dimensionsError = panoramaDimensionsError(info);
            if (dimensionsError) return setError(dimensionsError);
            upload.mutate({ title: title.trim(), image: file, preview: info.preview }, {
                onSuccess: reset,
                onError: (uploadError) => setError(Object.values(fieldErrors(uploadError))[0] ?? apiError(uploadError)),
            });
        } catch {
            setError('No pudimos leer la foto. Verifica que el archivo no esté dañado.');
        } finally {
            setReading(false);
        }
    };

    return {
        panoramas,
        count,
        limitReached: count >= MAX_PANORAMAS,
        title,
        changeTitle: (value: string) => {
            setTitle(value);
            setError(null);
        },
        file,
        fileInputKey,
        chooseFile,
        error,
        pending: reading || upload.isPending,
        progress: upload.isPending ? upload.progress : null,
        submit,
        remove: (id: number) => remove.mutate(id, { onError: (removeError) => setError(apiError(removeError)) }),
        removingId: remove.isPending ? remove.variables : null,
    };
}
