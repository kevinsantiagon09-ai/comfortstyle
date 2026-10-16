import type { LucideIcon } from 'lucide-react';

/** Identidad visual de cada rol: cómo se llama su "modo" y cómo se ve en el navbar y el inicio. */
export interface RoleMode {
    name: string;
    icon: LucideIcon;
    /** Clases de degradado de Tailwind (from/via/to). */
    gradient: string;
    greeting: string;
    tagline: string;
    dashboard: string;
    dashboardLabel: string;
}

// Props de componentes
export interface RoleModeBadgeProps {
    mode: RoleMode;
}
