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
