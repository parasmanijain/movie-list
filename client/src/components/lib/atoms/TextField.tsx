import { TextField as MaterialTextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';
import type { JSX } from 'react';
export const TextField = (props: TextFieldProps): JSX.Element => <MaterialTextField {...props} />;
