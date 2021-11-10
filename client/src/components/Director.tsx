import React, {useState, useEffect} from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';

const initialData = {
    labels: [],
    datasets: [
      {
        label: '# of Movies',
        data: [],
        backgroundColor: [
          
          
        ],
        borderColor: [
        ],
        borderWidth: 1,
      },
    ],
  }

  const dynamicColors = () => {
    var r = Math.floor(Math.random() * 255);
    var g = Math.floor(Math.random() * 255);
    var b = Math.floor(Math.random() * 255);
    return "rgba(" + r + "," + g + "," + b + ", 0.5)";
}

const poolColors = (a) => {
    var pool = [];
    for(let i = 0; i < a; i++) {
        pool.push(dynamicColors());
    }
    return pool;
}
  
  const options:ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // legend: { display: false },
    // scales: {
    //   yAxes: [
    //     {
    //       ticks: {
    //         beginAtZero: true,
    //       },
    //     },
    //   ],
    //   xAxes: [
    //     {
    //     ticks: {
    //           autoSkip: false,
    //           maxRotation: 90,
    //           minRotation: 90
    //       }
    //     }
    //   ]
    // },
  }

export const Director = () => {
    const [directorData, setDirectorData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const fetchData = () => {
        const directors = axios.get('http://localhost:8000/directorsCount');       
        axios.all([directors]).then(axios.spread((...responses) => {
            setDirectorData(responses[0].data);
            for(let i =0; i<responses[0].data.length;i+=100) {
              let arr = responses[0].data.slice(i,i+100);
              const set = JSON.parse(JSON.stringify(initialData));
              arr.forEach(elem=> {
                set.labels.push(elem.name);
                set.datasets[0].data.push(elem.length);
                set.datasets[0].backgroundColor =  poolColors(arr.length);
                set.datasets[0].borderColor =  poolColors(arr.length);
              })
              setChartData(prevArray=> [...prevArray, set])
            }
          })).catch(errors => {
            // react on errors.
          })
    }
    useEffect(() => {
        fetchData();
          return () => {
            setChartData([])
            setDirectorData([])
        }
    },[])
    return (
        <div className="main-container">

              
         { chartData.length && 
         
         <div className="chart-container">{
          chartData.map((elem, index) => 
            <Bar key={index}data={elem} height={900} options={{ maintainAspectRatio: false }}/>
          )
         }
         </div>
         }
         </div>
    )
}