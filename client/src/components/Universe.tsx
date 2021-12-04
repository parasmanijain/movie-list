import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { GET_UNIVERSES_COUNT_URL } from '../helper/config';
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

export const Universe = () => {
  const [, setOtherUniverseData] = useState([]);
  const [, setMarvelsUniverseData] = useState([]);
  const [otherUniverseChartData, setOtherUniverseChartData] = useState([]);
  const [marvelsUniverseChartData, setMarvelsUniverseChartData] = useState([]);
  const fetchData = () => {
    const universes = axios.get(`${GET_UNIVERSES_COUNT_URL}`);
    axios.all([universes]).then(axios.spread((...responses) => {
      const universeData = responses[0].data;
      const marvelUniverseData = universeData.filter((ele)=> (ele.name).toLowerCase().includes('marvel'));
      const otherUniverseData = universeData.filter((ele)=> !(ele.name).toLowerCase().includes('marvel'));
      setOtherUniverseData(otherUniverseData);
      setMarvelsUniverseData(marvelUniverseData);
      let data = [];
      let labels = [];
      let datasets = [];
      otherUniverseData.forEach((element)=> {
        data= [];
        labels = [];
        element.franchise.forEach((e)=> {
          labels.push(e.name);
          data.push(e.length);
        });
        const obj = {
          title: element.name,
          labels,
          datasets: [
            {
              label: 'Movies',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ] };

        datasets.push(obj);
      });
      setOtherUniverseChartData(datasets);
      datasets = [];
      marvelUniverseData.forEach((element)=> {
        data= [];
        labels = [];
        element.franchise.forEach((e)=> {
          labels.push(e.name);
          data.push(e.length);
        });
        const obj = {
          title: element.name,
          labels,
          datasets: [
            {
              label: 'Movies',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ] };

        datasets.push(obj);
      });
      setMarvelsUniverseChartData(datasets);
    })).catch((errors) => {
      // react on errors.
    });
  };

  const renderUniverseCharts = (title, element, index, length) => (<div className="chart-container" key={index}>{

    <Bar data={element} height={450} width={1750/length}
      options={{ maintainAspectRatio: false, plugins: { title: { text: title, display: true } } }} />
  }
  </div>)
  ;

  useEffect(() => {
    fetchData();
    return () => {
      setOtherUniverseChartData([]);
      setOtherUniverseData([]);
      setMarvelsUniverseChartData([]);
      setMarvelsUniverseData([]);
    };
  }, []);
  return (
    <React.Fragment>
      <div className="main-container">
        { [...marvelsUniverseChartData].length &&
    [...marvelsUniverseChartData].map((element, index, arr) => renderUniverseCharts(element.title, { ...element }, index, arr.length))}
        { [...otherUniverseChartData].length &&
    [...otherUniverseChartData].map((element, index, arr) => renderUniverseCharts(element.title, { ...element }, index, arr.length))}

      </div>
    </React.Fragment>);
};

