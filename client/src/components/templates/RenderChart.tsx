import React from 'react';
import { Bar, Box } from '../lib';

const renderOptions = (title, subtitle?, stacked?) => {
  let options = {
    maintainAspectRatio: false,
    plugins: {
      title: {
        text: title,
        display: true,
        font: {
          size: 16,
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
    },
    responsive: true
  };
  if (stacked) {
    options = {
      ...options,
      ...{
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true
          }
        }
      }
    };
  }
  return options;
};

export const RenderChart = (props: {
  title: string;
  subtitle: string;
  width;
  data;
  canvasHeight;
  index: number;
  stacked;
}) => {
  const { title, subtitle, width, data, canvasHeight, index, stacked } = props;
  return (
    <Box key={index} sx={{ display: 'inline-block' }}>
      <Bar
        data={data}
        width={width}
        height={canvasHeight}
        options={renderOptions(title, subtitle, stacked)}
      />
    </Box>
  );
};
