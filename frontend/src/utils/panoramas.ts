import { ACCEPTED_PANORAMA_TYPES, MAX_PANORAMA_SIZE, MIN_PANORAMA_WIDTH, PANORAMA_PREVIEW_WIDTH } from '../constants/panoramas';
import type { PanoramaFileInfo } from '../types/panorama';

/** Misma tolerancia que la regla dimensions:ratio=2/1 de Laravel, para no aceptar aquí lo que el backend rechazará. */
export const isPanoramaRatio = (width: number, height: number) =>
    Math.abs(width / height - 2) <= 1 / (Math.min(width, height) + 1);

/** Errores que se detectan sin abrir la imagen. */
export function panoramaFileError(file: File): string | null {
    if (!ACCEPTED_PANORAMA_TYPES.includes(file.type)) return 'La foto 360° debe ser JPG o WEBP.';
    if (file.size > MAX_PANORAMA_SIZE) return 'La foto 360° no puede superar los 20 MB.';
    return null;
}

export function panoramaDimensionsError({ width, height }: PanoramaFileInfo): string | null {
    if (!isPanoramaRatio(width, height)) return `No parece una foto 360°: mide ${width}×${height} y debe ser el doble de ancha que de alta (2:1).`;
    if (width < MIN_PANORAMA_WIDTH) return `La foto es muy pequeña (${width} px de ancho). Usa una de al menos ${MIN_PANORAMA_WIDTH} px.`;
    return null;
}

/** Lee las dimensiones y genera en el navegador una copia liviana para las vistas previas. */
export async function readPanorama(file: File): Promise<PanoramaFileInfo> {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const canvas = document.createElement('canvas');
    canvas.width = PANORAMA_PREVIEW_WIDTH;
    canvas.height = PANORAMA_PREVIEW_WIDTH / 2;
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const preview = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la vista previa.'))), 'image/jpeg', 0.8);
    });

    return { width, height, preview };
}
