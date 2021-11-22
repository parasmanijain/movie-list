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
  const [, setUniverseData] = useState([]);
  const [franchiseChartData, setFranchiseChartData] = useState(initialData);
  const [universeChartData, setUniverseChartData] = useState([]);
  const fetchData = () => {
    const franchises = axios.get(`${GET_FRANCHISES_COUNT_URL}`);
    const universes = axios.get(`${GET_UNIVERSES_COUNT_URL}`);
    axios.all([franchises, universes]).then(axios.spread((...responses) => {
      const franchiseData = responses[0].data;
      const universeData = responses[1].data;
      setFranchiseData(responses[0].data);
      setUniverseData(responses[1].data);
      let data = [];
      let labels = [];
      const datasets = [];
      franchiseData.forEach((element)=> {
        labels.push(element.name);
        data.push(element.length);
      });
      setFranchiseChartData({
        labels,
        datasets: [
          {
            label: 'Movies',
            backgroundColor: chartColors,
            hoverBackgroundColor: chartColors,
            data: data
          }
        ]
      });

      universeData.forEach((element)=> {
        data= [];
        labels = [];
        element.franchise.forEach((e)=> {
          labels.push(e.name);
          data.push(e.length);
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
          ] };

        datasets.push(obj);
      });
      setUniverseChartData(datasets);
    })).catch((errors) => {
      // react on errors.
    });
  };

  const renderUniverseCharts = (element, index, length) => (<div className="chart-container" key={index}>{
    <Bar data={element} height={450} width={1750/length}options={{ maintainAspectRatio: false }} />
  }
  </div>)
  ;

  useEffect(() => {
    fetchData();
    return () => {
      setFranchiseChartData(initialData);
      setFranchiseData([]);
      setUniverseChartData([]);
      setUniverseData([]);
    };
  }, []);
  return (
    <div className="main-container">
      {{ ...franchiseChartData }.datasets[0].data.length &&

        <div className="chart-container" id="erg">{
          <Bar data={{ ...franchiseChartData }} height={450} width={1750}options={{ maintainAspectRatio: false
          }} />
        }
        </div>
      }
      { [...universeChartData].length &&
    [...universeChartData].map((element, index, arr) => renderUniverseCharts({ ...element }, index, arr.length))}
    </div>);
};

