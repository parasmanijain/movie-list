import { Box as MaterialBox } from '@mui/material';
import type { BoxProps } from '@mui/material';
import type { ReactElement } from 'react';

export const Box = (props: BoxProps): ReactElement => <MaterialBox {...props} />;
