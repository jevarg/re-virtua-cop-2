import { Tooltip } from '@geist-ui/core';
import { Triangle } from '@geist-ui/icons';
import { Button } from '@VCRE/components/GeistFix';
import { useState } from 'react';

export type BackfaceCullingActionProps = {
    defaultState?: boolean;
    onToggle: (enabled: boolean) => void;
};

export function BackfaceCullingAction({ defaultState, onToggle }: BackfaceCullingActionProps) {
    const [enabled, setEnabled] = useState(defaultState || false);

    return (
        <Tooltip text='Backface culling' scale={2 / 3}>
            <Button
                auto
                scale={2 / 3}
                icon={<Triangle fill={enabled ? undefined : 'white'} />}
                onClick={() => {
                    onToggle(!enabled);
                    setEnabled(!enabled);
                }}
            />
        </Tooltip>
    );
}