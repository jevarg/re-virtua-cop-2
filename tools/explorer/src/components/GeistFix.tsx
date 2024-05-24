import GButton, { ButtonProps } from '@geist-ui/core/esm/button/button';
import GModalAction, { ModalActionProps } from '@geist-ui/core/esm/modal/modal-action';
import { ScaleProps } from '@geist-ui/core/esm/use-scale/scale-context';

/**
 * See https://github.com/geist-org/geist-ui/issues/858
 */

export const Button = (props: ButtonProps & ScaleProps) => {
    return <GButton
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
        {...props}
    />;
};

export const ModalAction = (props: ModalActionProps) => {
    return <GModalAction
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
        {...props}
    />;
};
