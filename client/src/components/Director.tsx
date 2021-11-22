import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../helper/colors';
import { GET_DIRECTORS_COUNT_URL } from '../helper/config';
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

// const pieOptions = {
//   legend: {
//     display: true,
//     position: 'bottom'
//   },
//   elements: {
//     arc: {
//       borderWidth: 0
//     }
//   }
// };


// const options = {
//   scales: {
//     yAxes: [
//       {
//         ticks: {
//           beginAtZero: true
//         }
//       }
//     ]
//   }
// };

// const styles = {
//   pieContainer: {
//     width: '40%',
//     height: '40%',
//     top: '50%',
//     left: '50%',
//     position: 'absolute',
//     transform: 'translate(-50%, -50%)'
//   },
//   relative: {
//     position: 'relative'
//   }
// };


// const dynamicColors = () => {
//   const r = Math.floor(Math.random() * 255);
//   const g = Math.floor(Math.random() * 255);
//   const b = Math.floor(Math.random() * 255);
//   return 'rgba(' + r + ',' + g + ',' + b + ', 0.5)';
// };

// const poolColors = (a) => {
//   const pool = [];
//   for (let i = 0; i < a; i++) {
//     pool.push(dynamicColors());
//   }
//   return pool;
// };

// const options = {
//   responsive: true,
//   maintainAspectRatio: false
// };

export const Director = () => {
  const [, setDirectorData] = useState([]);
  const [chartData, setChartData] = useState(initialData);
  const fetchData = () => {
    const directors = axios.get(`${GET_DIRECTORS_COUNT_URL}`);
    axios.all([directors]).then(axios.spread((...responses) => {
      const directorData = responses[0].data;
      setDirectorData(responses[0].data);
      const data = [];
      const labels = [];
      directorData.forEach((element)=> {
        labels.push(element.name);
        data.push(element.length);
      });
      setChartData({
        labels,
        datasets: [
          {
            label: 'Directors',
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
      setDirectorData([]);
    };
  }, []);

  return (
    <div className="main-container-director">
      <div className="chart-container-director">
        <Bar data={chartData} height={900}options={{ maintainAspectRatio: false }} />
      </div>
    </div>
  );
};
