import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_SIZE } from '../../constants/photos';
import { rejectionMessage } from '../../utils/photos';
import { useHostProperty } from '../properties/useHostProperty';
import { usePublishProperty } from '../properties/usePublishProperty';
import { usePropertyImages } from './usePropertyImages';
import { useUploadPropertyImages } from './useUploadPropertyImages';

/** Fotos de un alojamiento ya registrado: se suben al soltarlas y luego se puede publicar. */
export function usePropertyPhotosStep(propertyId: number) {
    const property = useHostProperty(propertyId);
    const images = usePropertyImages(propertyId);
    const upload = useUploadPropertyImages(propertyId);
    const publish = usePublishProperty(propertyId);
    const [rejected, setRejected] = useState<string[]>([]);

    const dropzone = useDropzone({
        accept: ACCEPTED_PHOTO_TYPES,
        maxSize: MAX_PHOTO_SIZE,
        disabled: upload.isPending,
        onDrop: (accepted, rejections) => {
            setRejected(rejections.map(rejectionMessage));
            if (accepted.length > 0) upload.mutate(accepted);
        },
    });

    return {
        property,
        images,
        photos: images.data ?? [],
        upload,
        publish,
        rejected,
        dropzone,
    };
}
