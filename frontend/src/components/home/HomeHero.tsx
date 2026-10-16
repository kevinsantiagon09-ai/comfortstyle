import { Link } from 'react-router-dom';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import heroImage from '../../assets/home-hero-palm.png';
import { paths } from '../../routes/paths';
import type { HomeHeroProps } from '../../types/home';

/** Portada según quién mira: visitante, huésped o anfitrión, sobre la foto de la palmera. */
export default function HomeHero({ mode, firstName, onExplore }: HomeHeroProps) {
    const Icon = mode?.icon ?? Sparkles;
    const isHost = mode?.dashboard === paths.host;

    return <section className="relative isolate overflow-hidden rounded-3xl px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
        {/* Foto de fondo con un velo oscuro a la izquierda para que el texto se lea sobre el cielo y las hojas. */}
        <img src={heroImage} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-[center_30%]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/75 via-slate-900/45 to-slate-900/10" />

        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold tracking-wide ring-1 ring-white/25 backdrop-blur">
            <Icon aria-hidden="true" className="h-4 w-4" />
            {mode ? `Estás como ${mode.name.toLowerCase()}` : 'Hospedajes con estilo en Colombia'}
        </span>

        <h1 className="mt-5 max-w-3xl text-3xl leading-tight font-extrabold sm:text-5xl">
            {firstName ? <>Hola, {firstName}.<br /><span className="text-white/90">{mode?.greeting}</span></> : <>Hospédate con estilo,<br /><span className="text-white/85">vive cada destino.</span></>}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/85 drop-shadow sm:text-lg">{mode?.tagline ?? 'Casas, cabañas y fincas verificadas, con recorrido 360° antes de reservar.'}</p>

        <div className="mt-8 flex flex-wrap gap-3">
            {mode ? <Link to={mode.dashboard} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100">
                {mode.dashboardLabel}<ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link> : <Link to={paths.register} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg hover:bg-slate-100">
                Crear cuenta gratis<ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>}
            {isHost ? <Link to={paths.hostSetup} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-bold ring-1 ring-white/30 backdrop-blur hover:bg-white/25">
                <Plus aria-hidden="true" className="h-4 w-4" />Publicar alojamiento
            </Link> : <button type="button" onClick={onExplore} className="inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-bold ring-1 ring-white/30 backdrop-blur hover:bg-white/25">
                Explorar hospedajes
            </button>}
        </div>
    </section>;
}
