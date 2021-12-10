import React from 'react';
import { Bar, Box } from '../../lib';

export const RenderChart = (props:any) => {
  const { title, width, data, canvasHeight, index } = props;
  return (
    <Box key = {index} sx = {{ display: 'inline-block' }}>
      <Bar data={data} width={width} height={canvasHeight} options={{ maintainAspectRatio: false,
        plugins: { title: { text: title, display: true }, subtitle: { text: data.title, display: true } } }} />
    </Box>
  );
};
