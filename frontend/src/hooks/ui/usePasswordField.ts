import { useId, useState } from 'react';

export function usePasswordField(label: string) {
    const id = useId();
    const [visible, setVisible] = useState(false);
    const toggleVisibility = () => setVisible((value) => !value);

    return {
        id,
        visible,
        inputType: visible ? 'text' : 'password',
        action: `${visible ? 'Ocultar' : 'Mostrar'} ${label.toLowerCase()}`,
        toggleVisibility,
    };
}
