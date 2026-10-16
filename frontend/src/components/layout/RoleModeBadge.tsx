import { Link } from 'react-router-dom';
import type { RoleModeBadgeProps } from '../../types/roleMode';

/** Insignia del rol actual ("Estás como anfitrión"): borde en degradado, punto "en vivo" y acceso directo a su panel. */
export default function RoleModeBadge({ mode }: RoleModeBadgeProps) {
    const Icon = mode.icon;

    return <Link to={mode.dashboard} title={mode.dashboardLabel} className={`group rounded-full bg-gradient-to-r p-[1.5px] shadow-sm transition hover:shadow-md ${mode.gradient}`}>
        <span className="flex items-center gap-2 rounded-full bg-white py-1 pr-3 pl-1 sm:pr-4">
            <span className={`grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br text-white ${mode.gradient}`}><Icon aria-hidden="true" className="h-4 w-4" /></span>
            <span className="hidden leading-none sm:block">
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" /></span>
                    Estás como
                </span>
                <span className="mt-0.5 block text-sm font-extrabold text-slate-900">{mode.name}</span>
            </span>
            <span className="text-sm font-extrabold text-slate-900 sm:hidden">{mode.name}</span>
        </span>
    </Link>;
}
