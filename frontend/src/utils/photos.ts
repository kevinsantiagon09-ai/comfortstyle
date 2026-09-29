import type { FileRejection } from 'react-dropzone';

export function rejectionMessage({ file, errors }: FileRejection): string {
    if (errors.some((error) => error.code === 'file-too-large')) return `${file.name}: supera los 5 MB.`;
    if (errors.some((error) => error.code === 'file-invalid-type')) return `${file.name}: solo se aceptan JPG, PNG o WEBP.`;
    return `${file.name}: no se pudo agregar.`;
}
