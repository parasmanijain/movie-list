import React from 'react';
import { GET_FRANCHISES_COUNT_URL } from '../helper/config';
import { withData } from '../HOC/withData';
import { RenderChart } from '../shared/RenderChart';
export default withData(RenderChart, { apiUrl: GET_FRANCHISES_COUNT_URL, label: 'Franchises' });
