import { MAX_PANORAMA_SIZE, MIN_PANORAMA_WIDTH, PANORAMA_PREVIEW_WIDTH } from '../constants/panoramas';
import type { PanoramaFileInfo } from '../types/panorama';

export function panoramaFileError(file: File): string | null {
    if (file.type && !file.type.startsWith('image/')) return 'Selecciona un archivo de imagen.';
    if (file.size > MAX_PANORAMA_SIZE) return 'La imagen no puede superar los 20 MB.';
    return null;
}

function toJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo preparar la imagen.'))), 'image/jpeg', quality);
    });
}

/** Adapta la imagen al visor sin recortar ni estirar su contenido. */
export async function readPanorama(file: File): Promise<PanoramaFileInfo> {
    const bitmap = await createImageBitmap(file);
    try {
        const width = Math.min(4096, Math.max(MIN_PANORAMA_WIDTH, Math.ceil(bitmap.width / 2) * 2));
        const height = width / 2;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('No se pudo preparar la imagen.');
        context.fillStyle = '#0f172a';
        context.fillRect(0, 0, width, height);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        const scale = Math.min(width / bitmap.width, height / bitmap.height);
        const drawnWidth = bitmap.width * scale;
        const drawnHeight = bitmap.height * scale;
        context.drawImage(bitmap, (width - drawnWidth) / 2, (height - drawnHeight) / 2, drawnWidth, drawnHeight);
        const blob = await toJpeg(canvas, 0.9);
        if (blob.size > MAX_PANORAMA_SIZE) throw new Error('La imagen preparada supera los 20 MB.');
        const image = new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'panorama'}.jpg`, { type: 'image/jpeg' });

        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = PANORAMA_PREVIEW_WIDTH;
        previewCanvas.height = PANORAMA_PREVIEW_WIDTH / 2;
        const previewContext = previewCanvas.getContext('2d');
        if (!previewContext) throw new Error('No se pudo generar la vista previa.');
        previewContext.drawImage(canvas, 0, 0, previewCanvas.width, previewCanvas.height);
        const preview = await toJpeg(previewCanvas, 0.8);
        return { width, height, image, preview };
    } finally {
        bitmap.close();
    }
}
