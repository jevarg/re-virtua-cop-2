import { ButtonProps, Button as GeistButton } from '@geist-ui/core';

// Weird and annoying issue with placeholder prop needing to be set...
export const Button = (props: ButtonProps) => {
    return <GeistButton placeholder={undefined} {...props} />;
};