import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { BarOptions, ChartOptions } from 'chart.js';
import { chartColors } from "../helper/colors";


const initialData = {
  labels: [],
  datasets: [
    {
      label: '# of Movies',
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: []
    },
  ],
}

const pieOptions = {
  legend: {
    display: true,
    position: "bottom"
  },
  elements: {
    arc: {
      borderWidth: 0
    }
  }
};

const styles = {
  pieContainer: {
    width: "40%",
    height: "40%",
    top: "50%",
    left: "50%",
    position: "absolute",
    transform: "translate(-50%, -50%)"
  },
  relative: {
    position: "relative"
  }
};


const dynamicColors = () => {
  var r = Math.floor(Math.random() * 255);
  var g = Math.floor(Math.random() * 255);
  var b = Math.floor(Math.random() * 255);
  return "rgba(" + r + "," + g + "," + b + ", 0.5)";
}

const poolColors = (a) => {
  var pool = [];
  for (let i = 0; i < a; i++) {
    pool.push(dynamicColors());
  }
  return pool;
}

const options = {
  responsive: true,
  maintainAspectRatio: false
}

export const Director = () => {
  const [directorData, setDirectorData] = useState([]);
  const [chartData, setChartData] = useState(initialData);
  let chartInstance = null;
  const fetchData = () => {
    const directors = axios.get('http://localhost:8000/directorsCount');
    axios.all([directors]).then(axios.spread((...responses) => {
      const directorData = responses[0].data;
      setDirectorData(responses[0].data);
      let data = []
      let labels = [];
      directorData.forEach(element=> {
        labels.push(element.name);
        data.push(element.length);
      })
      setChartData({
        labels,
        datasets: [
          {
            label: "Directors",
            backgroundColor: chartColors,
            hoverBackgroundColor: chartColors,
            data: data,
          },
        ],
      });
    })).catch(errors => {
      // react on errors.
    })
  }
  useEffect(() => {
    fetchData();
    return () => {
      setChartData(initialData)
      setDirectorData([])
    }
  }, [])

  return (
    <div className="main-container">

        <div className="chart-container">
          <Pie
            options={pieOptions}
            data={chartData}
            ref={input => {
              chartInstance = input;
            }}
          />
        </div>
    </div>
  )
}