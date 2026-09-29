import { useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTOS, MAX_PHOTO_SIZE } from '../../constants/photos';
import type { PhotoPickerProps } from '../../types/propertyForm';
import { rejectionMessage } from '../../utils/photos';

/** Fotos elegidas antes de registrar el alojamiento; se envían junto con el resto de datos. */
export function usePhotoPicker({ files, onChange, disabled }: Omit<PhotoPickerProps, 'error'>) {
    const [rejected, setRejected] = useState<string[]>([]);
    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);
    const full = files.length >= MAX_PHOTOS;

    const dropzone = useDropzone({
        accept: ACCEPTED_PHOTO_TYPES,
        maxSize: MAX_PHOTO_SIZE,
        disabled: disabled || full,
        onDrop: (accepted, rejections) => {
            const room = MAX_PHOTOS - files.length;
            const messages = rejections.map(rejectionMessage);
            if (accepted.length > room) messages.push(`Puedes agregar como máximo ${MAX_PHOTOS} fotografías.`);
            setRejected(messages);
            if (room > 0 && accepted.length > 0) onChange([...files, ...accepted.slice(0, room)]);
        },
    });

    return {
        rejected,
        previews,
        full,
        dropzone,
        remove: (index: number) => onChange(files.filter((_, i) => i !== index)),
    };
}
