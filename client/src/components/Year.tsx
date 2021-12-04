import React from 'react';
import { GET_YEARS_COUNT_URL } from '../helper/config';
import { RenderChart } from '../shared/RenderChart';
export const Year = () => <RenderChart apiUrl={GET_YEARS_COUNT_URL} label={'Years'}/>;
