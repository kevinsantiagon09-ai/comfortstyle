import { useParams } from 'react-router-dom';
import { toUuid } from '../../utils/routeParams';
import { useHostProperty } from './useHostProperty';

export function usePropertyEditPage() {
    const uuid = toUuid(useParams().uuid);
    const property = useHostProperty(uuid ?? '');

    return { valid: uuid !== null, property };
}
