import { Tooltip } from '@geist-ui/core';
import { Target } from '@geist-ui/icons';
import { Button } from '@VCRE/components/GeistFix';

export type CenterActionProps = {
    onClick: () => void;
};

export function CenterAction({ onClick }: CenterActionProps) {
    return (
        <Tooltip text='Center on model' scale={2 / 3}>
            <Button
                auto
                scale={2 / 3}
                icon={<Target />}
                onClick={() => onClick()}
            />
        </Tooltip>
    );
}