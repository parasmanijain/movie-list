import React from 'react';
import { GET_FRANCHISES_COUNT_URL } from '../helper/config';
import { getData } from '../HOC/getData';
import { RenderChart } from '../shared/RenderChart';
export default getData(RenderChart, { apiUrl: GET_FRANCHISES_COUNT_URL, label: 'Franchises' });
