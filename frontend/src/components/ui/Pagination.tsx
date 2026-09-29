import type { PaginationProps } from '../../types/ui';

export default function Pagination({ page, currentPage, lastPage, onPrevious, onNext, nextDisabled }: PaginationProps) {
    return <nav aria-label="Paginación" className="flex items-center justify-center gap-4">
        <button type="button" disabled={page <= 1} onClick={onPrevious} className="rounded-lg border px-4 py-2 disabled:opacity-40">Anterior</button>
        <span className="text-sm text-slate-600">Página {currentPage} de {lastPage}</span>
        <button type="button" disabled={page >= lastPage || nextDisabled} onClick={onNext} className="rounded-lg border px-4 py-2 disabled:opacity-40">Siguiente</button>
    </nav>;
}
