import {
    AlarmSmoke, Bath, BedDouble, BriefcaseMedical, Car, Cctv, Coffee, CookingPot, Fan, FireExtinguisher, Flame, Laptop,
    Microwave, PawPrint, Refrigerator, Shirt, ShowerHead, Snowflake, Sparkles, Sunset, Trees, Tv, WashingMachine, Waves, Wifi,
    type LucideIcon, type LucideProps,
} from 'lucide-react';

/** Columna `icon` de la tabla amenities (nombre de lucide.dev) → componente. Se listan explícitamente para no cargar todos los iconos. */
const icons: Record<string, LucideIcon> = {
    'alarm-smoke': AlarmSmoke, bath: Bath, 'bed-double': BedDouble, 'briefcase-medical': BriefcaseMedical, car: Car, cctv: Cctv,
    coffee: Coffee, 'cooking-pot': CookingPot, fan: Fan, 'fire-extinguisher': FireExtinguisher, flame: Flame, laptop: Laptop,
    microwave: Microwave, 'paw-print': PawPrint, refrigerator: Refrigerator, shirt: Shirt, 'shower-head': ShowerHead,
    snowflake: Snowflake, sunset: Sunset, trees: Trees, tv: Tv, 'washing-machine': WashingMachine, waves: Waves, wifi: Wifi,
};

export function AmenityIcon({ icon, ...props }: { icon: string | null } & LucideProps) {
    const Icon = (icon && icons[icon]) || Sparkles;
    return <Icon aria-hidden="true" {...props} />;
}
