import { Button as GButton, ButtonProps, Modal, ModalActionProps, ScaleProps } from '@geist-ui/core';

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
    return <Modal.Action
        onPointerEnterCapture={undefined}
        onPointerLeaveCapture={undefined}
        placeholder={undefined}
        {...props}
    />;
};
