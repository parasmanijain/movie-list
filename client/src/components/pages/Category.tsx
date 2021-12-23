import React from 'react';
import { GET_AWARDS_COUNT_URL } from '../../helper/config';
import { getData } from '../HOC/getData';
import { ChartContainer } from '../templates';
export default getData(ChartContainer, { apiUrl: GET_AWARDS_COUNT_URL, title: 'Categories' });
