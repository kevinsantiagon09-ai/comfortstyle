export interface PropertyType {
    id: number;
    uuid: string;
    name: string;
    description: string | null;
    icon: string | null;
    /** Anfitrión dueño; nulo en los tipos globales del administrador. */
    user_id: number | null;
}

export interface PropertyTypeInput {
    name: string;
}

export interface UpdatePropertyTypeVariables {
    uuid: string;
    data: PropertyTypeInput;
}

/** Editor en línea del selector: cerrado, creando un tipo o renombrando el elegido. */
export type PropertyTypeEditorMode = 'closed' | 'create' | 'edit';

// Props de componentes
export interface PropertyTypeFieldProps {
    value: string;
    error?: string;
    onChange: (id: string) => void;
}
