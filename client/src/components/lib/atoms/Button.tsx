import { Button as MaterialButton } from '@mui/material';
import type { ButtonProps } from '@mui/material';
import type { ReactElement } from 'react';

export const Button = (props: ButtonProps): ReactElement => <MaterialButton {...props} />;
