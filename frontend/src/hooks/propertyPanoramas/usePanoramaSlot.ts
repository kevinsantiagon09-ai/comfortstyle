import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MAX_PANORAMA_SIZE } from '../../constants/panoramas';
import type { PanoramaSlotCardProps } from '../../types/panorama';
import { panoramaFileError, preparePanorama } from '../../utils/panoramas';

/** Un contenedor del registro: valida la foto 360° soltada y genera su vista previa en el navegador. */
export function usePanoramaSlot({ draft, onPick, disabled }: Pick<PanoramaSlotCardProps, 'draft' | 'onPick' | 'disabled'>, title: string) {
    const [error, setError] = useState<string | null>(null);
    const [reading, setReading] = useState(false);
    const previewUrl = useMemo(() => (draft ? URL.createObjectURL(draft.preview) : null), [draft]);
    useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

    const dropzone = useDropzone({
        accept: { 'image/jpeg': ['.jpg', '.jpeg'], 'image/webp': ['.webp'], 'image/png': ['.png'] },
        maxSize: MAX_PANORAMA_SIZE,
        multiple: false,
        disabled: disabled || reading,
        onDrop: async (accepted, rejections) => {
            if (rejections.length > 0) return setError('Debe ser JPG, PNG o WEBP de máximo 100 MB.');
            const file = accepted[0];
            if (!file) return;
            const fileError = panoramaFileError(file);
            if (fileError) return setError(fileError);
            setError(null);
            setReading(true);
            try {
                const { file: ready, preview, converted } = await preparePanorama(file);
                onPick({ title, image: ready, preview, converted });
            } catch {
                setError('No pudimos procesar la foto. Verifica que el archivo no esté dañado.');
            } finally {
                setReading(false);
            }
        },
    });

    return { dropzone, previewUrl, error, reading };
}
