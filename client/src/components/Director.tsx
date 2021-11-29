import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../helper/colors';
import { GET_DIRECTORS_COUNT_URL } from '../helper/config';
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

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

const renderDirectors = (chartData, index) => {
  return (<div className="chart-container" key = {index}>
    <Bar data={chartData} width={1750} height={320} options={{ maintainAspectRatio: false,
      plugins: { title: { text: 'Directors', display: true } } }} /> </div>);
};

export const Director = () => {
  const [, setDirectorData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const fetchData = () => {
    const directors = axios.get(`${GET_DIRECTORS_COUNT_URL}`);
    axios.all([directors]).then(axios.spread((...responses) => {
      const directorData = responses[0].data;
      setDirectorData(responses[0].data);
      let chartDetails = [];
      const sets = createChunks(directorData, 40);
      sets.forEach((e)=> {
        const data = [];
        const labels = [];
        e.forEach((e1)=> {
          labels.push(e1.name);
          data.push(e1.length);
        });
        const obj = {
          labels,
          datasets: [
            {
              label: 'Movies',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ]
        };
        chartDetails = [...chartDetails, obj];
      });
      setChartData(chartDetails);
    })).catch((errors) => {
      // react on errors.
    });
  };
  useEffect(() => {
    fetchData();
    return () => {
      setChartData([]);
      setDirectorData([]);
    };
  }, []);

  return (
    <div className="main-container">

      {[...chartData].length && [...chartData].map((data, index)=> renderDirectors(data, index))}
    </div>
  );
};
