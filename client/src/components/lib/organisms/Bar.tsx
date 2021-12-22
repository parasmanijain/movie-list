import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  SubTitle
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    SubTitle
);
import { Bar as ChartJSBar } from 'react-chartjs-2';
export const Bar = (props) => <ChartJSBar {...props}/>;


