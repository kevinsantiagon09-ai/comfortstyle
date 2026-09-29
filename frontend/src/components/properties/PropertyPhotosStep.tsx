import { Link } from 'react-router-dom';
import { usePropertyPhotosStep } from '../../hooks/propertyImages/usePropertyPhotosStep';
import { paths } from '../../routes/paths';
import type { PhotosStepProps } from '../../types/propertyForm';
import { apiError } from '../../utils/apiError';
import { propertyImageUrl } from '../../utils/imageUrl';

export default function PropertyPhotosStep({ propertyId }: PhotosStepProps) {
    const { property, images, photos, upload, publish, rejected, dropzone: { getRootProps, getInputProps, isDragActive } } = usePropertyPhotosStep(propertyId);

    if (property.isPending) return <p role="status">Cargando alojamiento…</p>;
    if (property.isError) return <p role="alert">{apiError(property.error)} <Link to={paths.host} className="text-blue-700 underline">Volver al panel</Link></p>;

    const published = property.data.is_active;

    return <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div>
            <h2 className="text-xl font-semibold">Fotografías de «{property.data.name}»</h2>
            <p className="mt-1 text-sm text-slate-600">La primera foto será la portada. Formatos JPG, PNG o WEBP de hasta 5 MB.</p>
        </div>

        <div {...getRootProps({ className: `cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${isDragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:border-blue-400'} ${upload.isPending ? 'cursor-wait opacity-60' : ''}` })}>
            <input {...getInputProps()} aria-label="Agregar fotografías" />
            <p className="font-medium text-slate-800">{upload.isPending ? 'Subiendo fotografías…' : isDragActive ? 'Suelta las fotos aquí' : 'Arrastra tus fotos o haz clic para elegirlas'}</p>
        </div>

        {rejected.length > 0 && <ul role="alert" className="list-disc pl-5 text-sm text-red-700">{rejected.map((message) => <li key={message}>{message}</li>)}</ul>}
        {upload.isError && <p role="alert" className="text-sm text-red-700">{apiError(upload.error)} Las fotos anteriores al error sí se guardaron.</p>}

        {images.isPending && <p role="status">Cargando fotografías…</p>}
        {images.isError && <p role="alert">No pudimos cargar las fotografías. <button type="button" onClick={() => void images.refetch()} className="text-blue-700 underline">Reintentar</button></p>}
        {photos.length > 0 && <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {photos.map((photo) => <li key={photo.id} className="relative overflow-hidden rounded-xl border border-slate-200">
                <img src={propertyImageUrl(photo.image_path)} alt={photo.caption ?? property.data.name} className="h-32 w-full object-cover" />
                {photo.is_cover && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800">Portada</span>}
            </li>)}
        </ul>}

        {publish.isError && <p role="alert" className="text-sm text-red-700">{apiError(publish.error)}</p>}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6">
            <Link to={paths.host} className="rounded-xl border px-5 py-3">Guardar y salir</Link>
            {published
                ? <p role="status" className="font-semibold text-green-700">Tu alojamiento está publicado.</p>
                : <button type="button" onClick={() => publish.mutate()} disabled={photos.length === 0 || upload.isPending || publish.isPending} className="rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white disabled:opacity-50">
                    {publish.isPending ? 'Publicando…' : 'Publicar alojamiento'}
                </button>}
        </div>
        {!published && photos.length === 0 && <p className="text-xs text-slate-500">Agrega al menos una fotografía para publicar.</p>}
    </section>;
}
