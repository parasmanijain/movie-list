import React from 'react';
import { GET_DIRECTORS_COUNT_URL } from '../helper/config';
import { RenderChart } from '../shared/RenderChart';
export const Director = () => {
  return (
    <RenderChart apiUrl={GET_DIRECTORS_COUNT_URL} label={'Directors'}/>
  );
};
