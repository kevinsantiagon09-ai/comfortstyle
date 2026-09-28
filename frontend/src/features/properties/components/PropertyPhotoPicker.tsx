import { useEffect, useMemo, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';

export const MAX_PHOTOS = 10;
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };

function rejectionMessage({ file, errors }: FileRejection): string {
    if (errors.some((error) => error.code === 'file-too-large')) return `${file.name}: supera los 5 MB.`;
    if (errors.some((error) => error.code === 'file-invalid-type')) return `${file.name}: solo se aceptan JPG, PNG o WEBP.`;
    return `${file.name}: no se pudo agregar.`;
}

/** Fotos elegidas antes de registrar el alojamiento; se envían junto con el resto de datos. */
export default function PropertyPhotoPicker({ files, onChange, disabled, error }: { files: File[]; onChange: (files: File[]) => void; disabled?: boolean; error?: string }) {
    const [rejected, setRejected] = useState<string[]>([]);
    const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
    useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: ACCEPT,
        maxSize: MAX_SIZE,
        disabled: disabled || files.length >= MAX_PHOTOS,
        onDrop: (accepted, rejections) => {
            const room = MAX_PHOTOS - files.length;
            const messages = rejections.map(rejectionMessage);
            if (accepted.length > room) messages.push(`Puedes agregar como máximo ${MAX_PHOTOS} fotografías.`);
            setRejected(messages);
            if (room > 0 && accepted.length > 0) onChange([...files, ...accepted.slice(0, room)]);
        },
    });

    return <div className="space-y-4">
        <p className="text-sm text-slate-600">La primera foto será la portada. Formatos JPG, PNG o WEBP de hasta 5 MB, máximo {MAX_PHOTOS}.</p>
        <div {...getRootProps({ className: `cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${isDragActive ? 'border-blue-600 bg-blue-50' : error ? 'border-red-400' : 'border-slate-300 hover:border-blue-400'} ${files.length >= MAX_PHOTOS ? 'cursor-not-allowed opacity-60' : ''}` })}>
            <input {...getInputProps()} aria-label="Agregar fotografías" />
            <p className="font-medium text-slate-800">{isDragActive ? 'Suelta las fotos aquí' : files.length >= MAX_PHOTOS ? 'Alcanzaste el máximo de fotografías' : 'Arrastra tus fotos o haz clic para elegirlas'}</p>
        </div>
        {rejected.length > 0 && <ul role="alert" className="list-disc pl-5 text-sm text-red-700">{rejected.map((message) => <li key={message}>{message}</li>)}</ul>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {files.length > 0 && <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {files.map((file, index) => <li key={previews[index]} className="relative overflow-hidden rounded-xl border border-slate-200">
                <img src={previews[index]} alt={file.name} className="h-32 w-full object-cover" />
                {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800">Portada</span>}
                <button type="button" disabled={disabled} onClick={() => onChange(files.filter((_, i) => i !== index))} aria-label={`Quitar ${file.name}`} className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-red-700 disabled:opacity-50">Quitar</button>
            </li>)}
        </ul>}
    </div>;
}
