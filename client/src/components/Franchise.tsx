import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { GET_FRANCHISES_COUNT_URL, GET_UNIVERSES_COUNT_URL } from '../helper/config';
import { chartColors } from '../helper/colors';
import { RenderChart } from '../shared/RenderChart';

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
  const [, setOtherUniverseData] = useState([]);
  const [, setMarvelsUniverseData] = useState([]);
  const [franchiseChartData, setFranchiseChartData] = useState(initialData);
  const [otherUniverseChartData, setOtherUniverseChartData] = useState([]);
  const [marvelsUniverseChartData, setMarvelsUniverseChartData] = useState([]);
  const fetchData = () => {
    const franchises = axios.get(`${GET_FRANCHISES_COUNT_URL}`);
    const universes = axios.get(`${GET_UNIVERSES_COUNT_URL}`);
    axios.all([franchises, universes]).then(axios.spread((...responses) => {
      const franchiseData = responses[0].data;
      const universeData = responses[1].data;
      const marvelUniverseData = universeData.filter((ele)=> (ele.name).toLowerCase().includes('marvel'));
      const otherUniverseData = universeData.filter((ele)=> !(ele.name).toLowerCase().includes('marvel'));
      setFranchiseData(responses[0].data);
      setOtherUniverseData(otherUniverseData);
      setMarvelsUniverseData(marvelUniverseData);
      let data = [];
      let labels = [];
      let datasets = [];
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
      setFranchiseChartData(initialData);
      setFranchiseData([]);
      setOtherUniverseChartData([]);
      setOtherUniverseData([]);
      setMarvelsUniverseChartData([]);
      setMarvelsUniverseData([]);
    };
  }, []);
  return (
    <React.Fragment>


      <RenderChart apiUrl={GET_FRANCHISES_COUNT_URL} label={'Franchises'}/>
      <div className="main-container">
        { [...marvelsUniverseChartData].length &&
    [...marvelsUniverseChartData].map((element, index, arr) => renderUniverseCharts(element.title, { ...element }, index, arr.length))}
        { [...otherUniverseChartData].length &&
    [...otherUniverseChartData].map((element, index, arr) => renderUniverseCharts(element.title, { ...element }, index, arr.length))}

      </div>
    </React.Fragment>);
};

