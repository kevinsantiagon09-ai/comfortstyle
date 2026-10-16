import type { LucideIcon } from 'lucide-react';
import type { Property } from './property';
import type { RoleMode } from './roleMode';

export type HomeCategoryId = 'todo' | 'hospedajes' | 'servicios';

export interface HomeCategory {
    id: HomeCategoryId;
    label: string;
    description: string;
    icon: LucideIcon;
    /** Todavía no hay datos: se muestra la vista de lanzamiento. */
    soon?: boolean;
}

export interface UpcomingService {
    title: string;
    description: string;
    icon: LucideIcon;
    /** Clases del círculo del ícono. */
    accent: string;
}

// Props de componentes
export interface HomeHeroProps {
    mode: RoleMode | null;
    firstName: string | null;
    onExplore: () => void;
}

export interface HomeCategorySwitcherProps {
    active: HomeCategoryId;
    onSelect: (category: HomeCategoryId) => void;
    propertyCount: number | null;
}

export interface HomePropertiesProps {
    properties: Property[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
    /** En "Todo" se muestran solo algunos con un enlace a ver todos. */
    limit?: number;
    onSeeAll?: () => void;
}

export interface ServicesShowcaseProps {
    variant: 'teaser' | 'full';
    onOpen?: () => void;
}
