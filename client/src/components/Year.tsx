import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../helper/colors';
import { GET_YEARS_COUNT_URL } from '../helper/config';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

const renderYears = (chartData, index) => {
  return (<div className="chart-container" key = {index}>
    <Bar data={chartData} width={1750} height={450} options={{ maintainAspectRatio: false,
      plugins: { title: { text: 'Years', display: true } } }} /> </div>);
};

export const Year = () => {
  const [, setYearData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const fetchData = () => {
    const years = axios.get(`${GET_YEARS_COUNT_URL}`);
    axios.all([years]).then(axios.spread((...responses) => {
      const yearData = responses[0].data;
      setYearData(responses[0].data);
      let chartDetails = [];
      const sets = createChunks(yearData, Math.min(Math.ceil((yearData.length/2)), 50));
      sets.forEach((e)=> {
        const data = [];
        const labels = [];
        e.forEach((e1)=> {
          labels.push(e1._id);
          data.push(e1.count);
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
      setYearData([]);
    };
  }, []);

  return (
    <div className="main-container">

      {[...chartData].length && [...chartData].map((data, index)=> renderYears(data, index))}
    </div>
  );
};
