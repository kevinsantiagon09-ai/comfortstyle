import type { LucideIcon } from 'lucide-react';

/** Espacio del recorrido virtual: una foto 360° equirectangular (2:1) y su vista previa liviana. */
export interface PropertyPanorama {
    id: number;
    property_id: number;
    title: string;
    image_path: string;
    preview_path: string;
    display_order: number;
}

export interface PanoramaUpload {
    title: string;
    image: File;
    preview: Blob;
    /** Foto común convertida a panorama, no capturada con cámara 360°. */
    converted?: boolean;
}

export interface PreparedPanorama {
    file: File;
    preview: Blob;
    converted: boolean;
}

export interface PanoramaFileInfo {
    width: number;
    height: number;
    preview: Blob;
}

// Props de componentes
export interface PanoramaPreviewProps {
    path: string;
    /** Alto en píxeles; la animación necesita conocerlo para dar una vuelta completa. */
    height: number;
    className?: string;
}

export interface VirtualTourButtonProps {
    previewPath: string;
    scenes: number;
    onOpen: () => void;
}

export interface VirtualTourProps {
    panoramas: PropertyPanorama[];
    propertyName: string;
    onClose: () => void;
    onReserve: () => void;
}

export interface PanoramaViewerProps {
    path: string;
    title: string;
}

export interface TourScenesProps {
    panoramas: PropertyPanorama[];
    activeIndex: number;
    onSelect: (index: number) => void;
}

export interface PanoramaManagerProps {
    propertyId: number;
}

export interface PanoramaSlot {
    key: string;
    title: string;
    icon: LucideIcon;
}

/** Fotos 360° elegidas en el registro, por clave de espacio; se suben al crear el alojamiento. */
export type PanoramaDrafts = Record<string, PanoramaUpload>;

export interface PanoramaSlotsPickerProps {
    drafts: PanoramaDrafts;
    errors?: Record<string, string>;
    /** `changedKey` es el espacio modificado, para limpiar su error. */
    onChange: (drafts: PanoramaDrafts, changedKey: string) => void;
    disabled?: boolean;
}

export interface PanoramaSlotCardProps {
    slot: PanoramaSlot;
    draft?: PanoramaUpload;
    /** Error devuelto por el backend para este espacio. */
    error?: string;
    onPick: (upload: PanoramaUpload) => void;
    onClear: () => void;
    /** Otra miniatura se soltó aquí: recibe la clave del espacio de origen. */
    onMove: (fromKey: string) => void;
    disabled?: boolean;
}
