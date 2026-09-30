import { ACCEPTED_PANORAMA_TYPES, MAX_PANORAMA_SIZE, MIN_PANORAMA_WIDTH, PANORAMA_PREVIEW_WIDTH, SIMULATED_PANORAMA_WIDTH, WIDE_PHOTO_ASPECT } from '../constants/panoramas';
import type { PanoramaFileInfo, PreparedPanorama } from '../types/panorama';

/** Misma tolerancia que la regla dimensions:ratio=2/1 de Laravel, para no aceptar aquí lo que el backend rechazará. */
export const isPanoramaRatio = (width: number, height: number) =>
    Math.abs(width / height - 2) <= 1 / (Math.min(width, height) + 1);

/** Errores que se detectan sin abrir la imagen. */
export function panoramaFileError(file: File): string | null {
    if (!ACCEPTED_PANORAMA_TYPES.includes(file.type)) return 'La foto debe ser JPG, PNG o WEBP.';
    if (file.size > MAX_PANORAMA_SIZE) return 'La foto no puede superar los 100 MB.';
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

const toBlob = (canvas: HTMLCanvasElement, type: string, quality: number) => new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))), type, quality);
});

/**
 * Convierte una foto común en un panorama equirectangular 2:1 que cubre toda la esfera, como un 360° normal:
 * una foto ancha se extiende una sola vez por toda la esfera; una foto normal se repite a lo ancho, cada copia
 * reflejada respecto a la anterior (así los bordes empalman). Cada copia se recorta al centro en lugar de deformarse.
 */
async function toPanorama(file: File, bitmap: ImageBitmap): Promise<File> {
    const width = SIMULATED_PANORAMA_WIDTH;
    const height = width / 2;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas no disponible.');

    const aspect = bitmap.width / bitmap.height;
    const naturalWidth = (bitmap.width * height) / bitmap.height;
    // Copias pares para que el reflejo también cierre entre el último borde y el primero.
    const copies = aspect >= WIDE_PHOTO_ASPECT ? 1 : Math.max(2, 2 * Math.round(width / naturalWidth / 2));
    const tile = width / copies;
    // Recorte central del origen que, al escalarse a tile × height, conserva la proporción.
    const cropWidth = Math.min(bitmap.width, (bitmap.height * tile) / height);
    const cropHeight = (cropWidth * height) / tile;
    const sx = (bitmap.width - cropWidth) / 2;
    const sy = (bitmap.height - cropHeight) / 2;

    for (let index = 0; index < copies; index++) {
        context.save();
        context.translate(index % 2 === 0 ? index * tile : (index + 1) * tile, 0);
        context.scale(index % 2 === 0 ? 1 : -1, 1);
        context.drawImage(bitmap, sx, sy, cropWidth, cropHeight, 0, 0, tile, height);
        context.restore();
    }

    const blob = await toBlob(canvas, 'image/jpeg', 0.92);
    return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-360.jpg`, { type: 'image/jpeg' });
}

/** Devuelve la foto lista para subir: una 360° real se envía tal cual; cualquier otra se convierte. */
export async function preparePanorama(file: File): Promise<PreparedPanorama> {
    const bitmap = await createImageBitmap(file);
    try {
        const isReal = isPanoramaRatio(bitmap.width, bitmap.height) && bitmap.width >= MIN_PANORAMA_WIDTH && file.type !== 'image/png';
        const ready = isReal ? file : await toPanorama(file, bitmap);
        const { preview } = await readPanorama(ready);
        return { file: ready, preview, converted: !isReal };
    } finally {
        bitmap.close();
    }
}
