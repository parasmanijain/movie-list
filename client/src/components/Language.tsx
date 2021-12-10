import React from 'react';
import { GET_LANGUAGES_COUNT_URL } from '../helper/config';
import { getData } from '../HOC/getData';
import { ChartContainer } from './shared/ChartContainer';
export default getData(ChartContainer, { apiUrl: GET_LANGUAGES_COUNT_URL, title: 'Languages' });
