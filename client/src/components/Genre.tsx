import React from 'react';
import { GET_GENRES_COUNT_URL } from '../helper/config';
import { RenderChart } from '../shared/RenderChart';
export const Genre = () => <RenderChart apiUrl={GET_GENRES_COUNT_URL} label={'Genres'}/>;
