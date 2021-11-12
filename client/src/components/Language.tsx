import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { GET_LANGUAGES_COUNT_URL } from '../helper/config';

const initialData = {
  labels: [],
  datasets: [
    {
      label: '',
      data: [],
      backgroundColor: [
      ],
      borderColor: [
      ],
      borderWidth: 1
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

export const Language = () => {
  const [, setLanguageData] = useState([]);
  const [chartData, setChartData] = useState(initialData);
  const data = JSON.parse(JSON.stringify(initialData));
  useEffect(() => {
    axios.get(`${GET_LANGUAGES_COUNT_URL}`, {
    })
        .then(function(response) {
          setLanguageData(response.data);
          response.data.forEach((elem) => {
            data.labels.push(elem.name);
            data.datasets[0].data.push(elem.length);
            data.datasets[0].backgroundColor = poolColors(response.data.length);
            data.datasets[0].borderColor = poolColors(response.data.length);
          });
          setChartData({
            labels: data.labels,
            datasets: data.datasets
          });
        })
        .catch(function(response) {
          console.log(response);
        });
    return () => {
      setChartData({
        labels: initialData.labels,
        datasets: initialData.datasets
      });
      setLanguageData([]);
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

