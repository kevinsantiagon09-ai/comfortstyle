import { ArrowRight, Sparkles } from 'lucide-react';
import { UPCOMING_SERVICES } from '../../constants/home';
import type { ServicesShowcaseProps } from '../../types/home';

/** Servicios aún no tiene datos: se presenta como lanzamiento, en franja (Todo) o completo (pestaña). */
export default function ServicesShowcase({ variant, onOpen }: ServicesShowcaseProps) {
    if (variant === 'teaser') {
        return <section className="relative isolate overflow-hidden rounded-3xl bg-slate-900 px-6 py-8 text-white sm:px-10">
            <div aria-hidden="true" className="absolute -top-20 right-10 -z-10 h-56 w-56 rounded-full bg-amber-400/25 blur-3xl" />
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-extrabold tracking-wide uppercase"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" />Muy pronto</span>
                    <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">Servicios ComfortStyle</h2>
                    <p className="mt-2 text-white/70">Tu hospedaje y todo lo que lo rodea en una sola reserva: experiencias, chef, traslados y bienestar.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex -space-x-2">{UPCOMING_SERVICES.map(({ title, icon: Icon, accent }) => <span key={title} title={title} className={`grid h-11 w-11 place-items-center rounded-full ring-4 ring-slate-900 ${accent}`}><Icon aria-hidden="true" className="h-5 w-5" /></span>)}</div>
                    {onOpen && <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-900 hover:bg-slate-100">Conocer servicios<ArrowRight aria-hidden="true" className="h-4 w-4" /></button>}
                </div>
            </div>
        </section>;
    }

    return <section>
        <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-extrabold tracking-wide text-white uppercase"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" />Lanzamiento próximo</span>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Mucho más que un lugar para dormir</h2>
            <p className="mt-2 text-slate-600">Estamos preparando servicios para completar tu estadía. Los anfitriones podrán ofrecerlos y tú los agregarás a tu reserva.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {UPCOMING_SERVICES.map(({ title, description, icon: Icon, accent }) => <article key={title} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className="absolute top-5 right-5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-slate-500 uppercase">Pronto</span>
                <span className={`grid h-12 w-12 place-items-center rounded-xl ${accent}`}><Icon aria-hidden="true" className="h-6 w-6" /></span>
                <h3 className="mt-4 text-lg font-extrabold text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-600">{description}</p>
            </article>)}
        </div>
    </section>;
}
