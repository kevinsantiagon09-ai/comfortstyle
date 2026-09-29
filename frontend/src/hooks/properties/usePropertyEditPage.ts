import { useParams } from 'react-router-dom';
import { toPositiveId } from '../../utils/routeParams';
import { useHostProperty } from './useHostProperty';

export function usePropertyEditPage() {
    const id = toPositiveId(useParams().id);
    const property = useHostProperty(id ?? 0);

    return { valid: id !== null, property };
}
