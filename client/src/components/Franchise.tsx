import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { GET_FRANCHISES_COUNT_URL, GET_UNIVERSES_COUNT_URL } from '../helper/config';
import { chartColors } from '../helper/colors';

const initialData = {
  labels: [],
  datasets: [
    {
      label: '# of Movies',
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    }
  ]
};

// const options = {
//   responsive: true,
//   maintainAspectRatio: false,
//   legend: { display: false },
//   scales: {
//     yAxes: [
//       {
//         ticks: {
//           beginAtZero: true,
//         },
//       },
//     ],
//     xAxes: [
//       {
//       ticks: {
//             autoSkip: false,
//             maxRotation: 90,
//             minRotation: 90
//         }
//       }
//     ]
//   },
// }

const dynamicColors = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  return 'rgba(' + r + ',' + g + ',' + b + ', 0.5)';
};

const poolColors = (a) => {
  const pool = [];
  for (let i = 0; i < a; i++) {
    pool.push(dynamicColors());
  }
  return pool;
};

export const Franchise = () => {
  const [, setFranchiseData] = useState([]);
  const [chartData, setChartData] = useState(initialData);
  const data = JSON.parse(JSON.stringify(initialData));
  // eslint-disable-next-line no-unused-vars
  const chartInstance = null;
  const fetchData = () => {
    const franchises = axios.get(`${GET_FRANCHISES_COUNT_URL}`);
    const universes = axios.get(`${GET_UNIVERSES_COUNT_URL}`);
    axios.all([franchises]).then(axios.spread((...responses) => {
      const franchiseData = responses[0].data;
      console.log(responses[1].data);
      setFranchiseData(responses[0].data);
      const data = [];
      const labels = [];
      franchiseData.forEach((element)=> {
        labels.push(element.name);
        data.push(element.length);
      });
      setChartData({
        labels,
        datasets: [
          {
            label: 'Franchise',
            backgroundColor: chartColors,
            hoverBackgroundColor: chartColors,
            data: data
          }
        ]
      });
    })).catch((errors) => {
      // react on errors.
    });
  };
  useEffect(() => {
    fetchData();
    return () => {
      setChartData(initialData);
      setFranchiseData([]);
    };
  }, []);
  return (
    <div className="main-container">
      {chartData.datasets[0].data.length &&

        <div className="chart-container">{
          <Bar data={chartData} height={900} options={{ maintainAspectRatio: false }} />
        }
        </div>
      }
    </div>);
};

