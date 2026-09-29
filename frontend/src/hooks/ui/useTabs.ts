import { useId, useRef, useState, type KeyboardEvent } from 'react';
import type { TabButtonProps, TabPanelProps } from '../../types/ui';

/** Estado y accesibilidad de un grupo de pestañas: clic, flechas, Inicio y Fin. */
export function useTabs(count: number) {
    const prefix = useId();
    const [active, setActive] = useState(0);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);

    const focusTab = (index: number) => {
        const next = (index + count) % count;
        setActive(next);
        tabs.current[next]?.focus();
    };
    const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'ArrowRight') focusTab(active + 1);
        else if (event.key === 'ArrowLeft') focusTab(active - 1);
        else if (event.key === 'Home') focusTab(0);
        else if (event.key === 'End') focusTab(count - 1);
        else return;
        event.preventDefault();
    };

    const tabProps = (index: number): TabButtonProps => ({
        id: `${prefix}-tab-${index}`,
        type: 'button',
        role: 'tab',
        'aria-selected': index === active,
        'aria-controls': `${prefix}-panel`,
        tabIndex: index === active ? 0 : -1,
        ref: (element) => { tabs.current[index] = element; },
        onClick: () => setActive(index),
        onKeyDown,
    });
    const panelProps: TabPanelProps = {
        id: `${prefix}-panel`,
        role: 'tabpanel',
        'aria-labelledby': `${prefix}-tab-${active}`,
    };

    return { active, select: setActive, tabProps, panelProps };
}
