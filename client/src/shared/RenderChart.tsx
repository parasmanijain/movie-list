import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { chartColors } from '../helper/colors';
import { useWindowDimensions } from '../hooks/useWindowDimensions';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

const renderData = (chartData, index, width, height, length, label, partialHeight) => {
  const canvasHeight = !partialHeight ? length> 1 ? height>450? height/2: height : height: height/2;
  return (<div className="chart-container" key = {index}>
    <Bar data={chartData} width={width-50} height={canvasHeight-50} options={{ maintainAspectRatio: false,
      plugins: { title: { text: label, display: true } } }} /> </div>);
};

export const RenderChart = (props:any) => {
  const [width, height] = useWindowDimensions();
  const { label, partialHeight, apiData } = props;
  const chunkSize = width>= 1536 ? 50 : width>= 1200 ? 40 : width>= 900 ? 30 : width>=600 ? 20 : 10;
  const [chartData, setChartData] = useState([]);
  const fetchData = () => {
    let chartDetails = [];
    const sets = createChunks(apiData, apiData.length> chunkSize ? Math.min(Math.ceil((apiData.length)/2), chunkSize): apiData.length);
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
  };
  useEffect(() => {
    fetchData();
    return () => {
      setChartData([]);
    };
  }, [apiData]);

  return (
    <div className="main-container">

      {[...chartData].length && [...chartData].map((data, index, arr)=>
        renderData(data, index, width, height, arr.length, label, partialHeight))}
    </div>
  );
};
