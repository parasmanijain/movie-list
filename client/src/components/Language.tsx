import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../helper/colors';
import { GET_LANGUAGES_COUNT_URL } from '../helper/config';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

const renderLanguages = (chartData, index) => {
  return (<div className="chart-container" key = {index}>
    <Bar data={chartData} width={1750} height={450} options={{ maintainAspectRatio: false,
      plugins: { title: { text: 'Languages', display: true } } }} /> </div>);
};

export const Language = () => {
  const [, setLanguageData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const fetchData = () => {
    const languages = axios.get(`${GET_LANGUAGES_COUNT_URL}`);
    axios.all([languages]).then(axios.spread((...responses) => {
      const languageData = responses[0].data;
      setLanguageData(responses[0].data);
      let chartDetails = [];
      const sets = createChunks(languageData, Math.min(Math.ceil((languageData.length)/2), 50));
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
      setLanguageData([]);
    };
  }, []);

  return (
    <div className="main-container">

      {[...chartData].length && [...chartData].map((data, index)=> renderLanguages(data, index))}
    </div>
  );
};
