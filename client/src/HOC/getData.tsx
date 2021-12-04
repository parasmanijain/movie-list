import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Box, Progress } from '../lib';
export const getData = (WrappedComponent, { apiUrl, label }) => {
  const Component = (props) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchData = () => {
      const list = axios.get(apiUrl);
      setLoading(true);
      axios.all([list]).then(axios.spread((...responses) => {
        setLoading(false);
        setData(responses[0].data);
      })).catch((errors) => {
        setLoading(false);
        console.log(errors);
      });
    };
    useEffect(() => {
      fetchData();
      return () => {
        setData([]);
      };
    }, []);
    return (
      loading ? <Box sx={{ height: '100vh', width: '100vw', display: 'flex',
        justifyContent: 'center', alignItems: 'center' }}><Progress/></Box> :
      <WrappedComponent apiData={data} label={label} {...props} />
    );
  };
  Component.displayName = 'test';
  return Component;
};
