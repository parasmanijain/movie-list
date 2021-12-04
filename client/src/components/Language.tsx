import React from 'react';
import { GET_LANGUAGES_COUNT_URL } from '../helper/config';
import { RenderChart } from '../shared/RenderChart';
export const Language = () => {
  return (
    <RenderChart apiUrl={GET_LANGUAGES_COUNT_URL} label={'Languages'}/>
  );
};
