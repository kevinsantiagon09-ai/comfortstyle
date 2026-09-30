import type { FileRejection } from 'react-dropzone';

export function rejectionMessage({ file, errors }: FileRejection): string {
    if (errors.some((error) => error.code === 'file-too-large')) return `${file.name}: supera los 5 MB.`;
    if (errors.some((error) => error.code === 'file-invalid-type')) return `${file.name}: solo se aceptan JPG, PNG o WEBP.`;
    return `${file.name}: no se pudo agregar.`;

}

export function galleryThumbClass(index: number, total: number): string {
    if (total === 1) return 'sm:col-span-2 sm:row-span-2';
    if (total === 2) return 'sm:col-span-2';
    if (total === 3 && index === 2) return 'sm:col-span-2';
    return '';
}