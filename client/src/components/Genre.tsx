import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../helper/colors';
import { GET_GENRES_COUNT_URL } from '../helper/config';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

const renderGenres = (chartData, index) => {
  return (<div className="chart-container" key = {index}>
    <Bar data={chartData} width={1750} height={450} options={{ maintainAspectRatio: false,
      plugins: { title: { text: 'Genres', display: true } } }} /> </div>);
};

export const Genre = () => {
  const [, setGenreData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const fetchData = () => {
    const genres = axios.get(`${GET_GENRES_COUNT_URL}`);
    axios.all([genres]).then(axios.spread((...responses) => {
      const genreData = responses[0].data;
      setGenreData(responses[0].data);
      let chartDetails = [];
      const sets = createChunks(genreData, Math.min(Math.ceil((genreData.length)/2), 50));
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
      setGenreData([]);
    };
  }, []);

  return (
    <div className="main-container">

      {[...chartData].length && [...chartData].map((data, index)=> renderGenres(data, index))}
    </div>
  );
};
