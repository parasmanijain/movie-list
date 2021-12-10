import React, { useState, useEffect } from 'react';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import { chartColors } from '../../helper';
import { RenderChart } from './RenderChart';
import { Box } from '../../lib';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

export const ChartContainer = (props:any) => {
  const { title, fullHeight, apiData } = props;
  const [chartData, setChartData] = useState([]);
  const [width, height] = useWindowDimensions();
  const chunkSize = width>= 1536 ? 50 : width>= 1200 ? 40 : width>= 900 ? 30 : width>=600 ? 20 : 10;


  const fetchData = () => {
    let chartDetails = [];
    if (apiData.length && title.toLowerCase().includes('universes')) {
      const marvelUniverseData = apiData.filter((ele)=> (ele.name).toLowerCase().includes('marvel'));
      const otherUniverseData = apiData.filter((ele)=> !(ele.name).toLowerCase().includes('marvel'));
      let data = [];
      let labels = [];
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
        chartDetails = [...chartDetails, obj];
      });
      otherUniverseData.forEach((element, i, arr)=> {
        data= [];
        labels = [];
        element.franchise.forEach((e)=> {
          labels.push(e.name);
          data.push(e.length);
        });
        const obj = {
          title: element.name,
          width: width/arr.length - (50/arr.length),
          labels,
          datasets: [
            {
              label: 'Movies',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ] };
        chartDetails = [...chartDetails, obj];
      });
    } else {
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
    }
    setChartData(chartDetails);
  };

  useEffect(() => {
    fetchData();
    return () => {
      setChartData([]);
    };
  }, [apiData]);
  return (
    <Box>
      {[...chartData].length && [...chartData].map((data, index) =>
        <RenderChart key = {index} title = {title} width = {data.width? data.width : width-50} data = {data} index = {index}
          canvasHeight = {(!fullHeight ? chartData.length> 1 ? height>450? height/2: height : height: height/2)-50}/>)}
    </Box>
  );
};
