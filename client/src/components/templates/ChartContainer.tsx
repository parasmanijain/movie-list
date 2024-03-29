import { useState, useEffect } from 'react';
import { useWindowDimensions } from '../../hooks/useWindowDimensions';
import { chartColors } from '../../helper';
import { RenderChart } from './RenderChart';
import { Box } from '../lib';

const createChunks = (array, chunk) => {
  const temp = [];
  for (let i = 0, j = array.length; i < j; i += chunk) {
    temp.push(array.slice(i, i + chunk));
  }
  return temp;
};

export const ChartContainer = (props: { title: string; fullHeight; apiData; stacked }) => {
  const { title, fullHeight, apiData, stacked } = props;
  const [chartData, setChartData] = useState([]);
  const [width, height] = useWindowDimensions();
  const chunkSize =
    width >= 1536 ? 50 : width >= 1200 ? 40 : width >= 900 ? 30 : width >= 600 ? 20 : 10;

  const fetchData = () => {
    let chartDetails = [];
    if (apiData.length && title.toLowerCase().includes('universes')) {
      const marvelUniverseData = apiData.filter((ele) => ele.name.toLowerCase().includes('marvel'));
      const otherUniverseData = apiData.filter((ele) => !ele.name.toLowerCase().includes('marvel'));
      let data = [];
      let labels = [];
      marvelUniverseData.forEach((element) => {
        data = [];
        labels = [];
        element.franchise.forEach((e) => {
          labels.push(e.name);
          data.push(e.length);
        });
        const obj = {
          subtitle: element.name,
          width: width - 50,
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
      otherUniverseData.forEach((element, i, arr) => {
        data = [];
        labels = [];
        element.franchise.forEach((e) => {
          labels.push(e.name);
          data.push(e.length);
        });
        const obj = {
          subtitle: element.name,
          width: (width - 50) / arr.length,
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
    } else if (apiData.length && title.toLowerCase().includes('categories')) {
      let data = [];
      let labels = [];
      apiData.forEach((element) => {
        data = [];
        labels = [];
        element.category.forEach((e) => {
          labels.push(e.name);
          data.push(e.length);
        });
        const obj = {
          title: element.name,
          subtitle: element.name,
          width: width - 50,
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
    } else if (apiData.length && title.toLowerCase().includes('director movies')) {
      const sets = createChunks(
        apiData,
        apiData.length > chunkSize
          ? Math.min(Math.ceil(apiData.length / 2), chunkSize)
          : apiData.length
      );

      sets.forEach((e) => {
        const data = [];
        const labels = [];
        e.forEach((el) => {
          labels.push(el.movie_count);
          data.push(el.director_count);
        });

        const obj = {
          labels,
          width: width - 50,
          datasets: [
            {
              label: 'No of Directors',
              backgroundColor: chartColors,
              hoverBackgroundColor: chartColors,
              data: data
            }
          ]
        };
        chartDetails = [...chartDetails, obj];
      });
    } else {
      const sets = createChunks(
        apiData,
        apiData.length > chunkSize
          ? Math.min(Math.ceil(apiData.length / 2), chunkSize)
          : apiData.length
      );
      sets.forEach((e) => {
        const data = [];
        const labels = [];
        e.forEach((e1) => {
          const label =
            e1.name + (title.toLowerCase().includes('movies') ? ' (' + e1.year + ')' : '');
          labels.push(label);
          data.push(e1.length);
        });
        const obj = {
          labels,
          width: width - 50,
          datasets: [
            {
              label: title.toLowerCase().includes('movies') ? 'Awards' : 'Movies',
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
      {[...chartData].length &&
        [...chartData].map((data, index) => (
          <RenderChart
            key={index}
            title={title.toLowerCase().includes('universes') ? data.subtitle : title}
            width={data.width}
            subtitle={title.toLowerCase().includes('categories') ? data.subtitle : ''}
            data={data}
            index={index}
            stacked={stacked}
            canvasHeight={
              (!fullHeight
                ? chartData.length > 1
                  ? height > 500
                    ? height / 2
                    : height
                  : height
                : height / 2) - 50
            }
          />
        ))}
    </Box>
  );
};
