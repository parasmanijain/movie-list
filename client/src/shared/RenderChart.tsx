import React from 'react';
import { Bar } from '../lib';

export const RenderChart = (props:any) => {
  const { title, width, data, canvasHeight, index } = props;
  return (
    <div className="chart-container" key = {index}>
      <Bar data={data} width={width} height={canvasHeight} options={{ maintainAspectRatio: false,
        plugins: { title: { text: title, display: true }, subtitle: { text: data.title, display: true } } }} /> </div>
  );
};
