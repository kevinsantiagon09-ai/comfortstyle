import { Link } from 'react-router-dom';
import { Camera, MapPin, Pencil, Send } from 'lucide-react';
import { hostPropertyEditPath, hostPropertyPhotosPath } from '../../routes/paths';
import type { PropertyCardProps } from '../../types/property';
import { propertyImageUrl } from '../../utils/imageUrl';
import { coverImage } from '../../utils/property';
import { formatPrice } from '../../utils/propertyForm';

export default function HostPropertyCard({ property }: PropertyCardProps) {
    return <li className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <img src={propertyImageUrl(coverImage(property)?.image_path)} alt="" className="h-40 w-full object-cover" />
        <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">{property.name}</h2>
                <span className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-semibold ${property.is_active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    {property.is_active ? 'Publicado' : 'Borrador'}
                </span>
            </div>
            <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin aria-hidden="true" className="h-4 w-4 shrink-0" />{property.city}, {property.department}</p>
            <p className="text-slate-900"><strong>{formatPrice(property)}</strong> <span className="text-sm text-slate-500">por noche</span></p>
            <div className="flex gap-2 border-t border-slate-100 pt-3">
                <Link to={hostPropertyEditPath(property.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white">
                    <Pencil aria-hidden="true" className="h-4 w-4" />Editar
                </Link>
                <Link to={hostPropertyPhotosPath(property.id)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:border-blue-400">
                    {property.is_active ? <><Camera aria-hidden="true" className="h-4 w-4" />Fotografías</> : <><Send aria-hidden="true" className="h-4 w-4" />Publicar</>}
                </Link>
            </div>
        </div>
    </li>;
}
