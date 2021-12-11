import React from 'react';
import { Bar, Box } from '../../lib';

const renderOptions = (title, subtitle?) => {
  return (
    { maintainAspectRatio: false,
      plugins:
    {
      title: {
        text: title,
        display: true,
        font:
        { size: 16,
          weight: 700
        }
      },
      subtitle: {
        text: subtitle,
        display: true,
        font: {
          size: 14,
          weight: 500
        }
      }
    }
    }
  );
};

export const RenderChart = (props:any) => {
  const { title, subtitle, width, data, canvasHeight, index } = props;
  return (
    <Box key = {index} sx = {{ display: 'inline-block' }}>
      <Bar data={data} width={width} height={canvasHeight}
        options={renderOptions(title, subtitle)} />
    </Box>
  );
};
