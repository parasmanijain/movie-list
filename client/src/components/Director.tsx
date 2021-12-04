import React from 'react';
import { GET_DIRECTORS_COUNT_URL } from '../helper/config';
import { getData } from '../HOC/getData';
import { RenderChart } from '../shared/RenderChart';
export default getData(RenderChart, { apiUrl: GET_DIRECTORS_COUNT_URL, label: 'Directors' });
