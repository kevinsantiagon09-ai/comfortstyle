import { Link } from 'react-router-dom';
import { propertyDetailPath } from '../../routes/paths';
import type { NearbyPropertyListProps } from '../../types/map';
import { propertyImageUrl } from '../../utils/imageUrl';
import { formatDistance, shortPrice } from '../../utils/map';

/** Tarjetas de los alojamientos cercanos; al pasar por una se resalta en el mapa y se traza la línea hasta ella. */
export default function NearbyPropertyList({ items, activeUuid, onActivate }: NearbyPropertyListProps) {
    return <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Otros alojamientos cerca</h3>
        <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
            {items.map((item) => (
                <li key={item.uuid} className="w-56 shrink-0 snap-start">
                    <Link
                        to={propertyDetailPath(item.uuid)}
                        onMouseEnter={() => onActivate(item.uuid)}
                        onMouseLeave={() => onActivate(null)}
                        onFocus={() => onActivate(item.uuid)}
                        onBlur={() => onActivate(null)}
                        className={`block overflow-hidden rounded-xl border bg-white transition ${activeUuid === item.uuid ? 'border-blue-600 shadow-lg ring-2 ring-blue-600/20' : 'border-slate-200 hover:shadow-md'}`}
                    >
                        <img src={propertyImageUrl(item.cover_path)} alt="" loading="lazy" className="h-28 w-full object-cover" />
                        <span className="block space-y-0.5 p-3">
                            <span className="block truncate text-sm font-semibold text-slate-900">{item.name}</span>
                            <span className="block text-xs text-slate-500">{item.city} · a {formatDistance(item.distanceKm)}</span>
                            <span className="block text-sm text-slate-900"><strong>{shortPrice(item.price)}</strong> {item.currency} / noche</span>
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    </div>;
}
