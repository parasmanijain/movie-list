import axios from 'axios';
import React, { useEffect, useState } from 'react';
export const postData = (WrappedComponent, { apiUrl, label }) => {
  const Component = (props) => {
    const [data, setData] = useState([]);
    const fetchData = () => {
      const list = axios.get(apiUrl);
      axios.all([list]).then(axios.spread((...responses) => {
        setData(responses[0].data);
      })).catch((errors) => {
        // react on errors.
      });
    };
    useEffect(() => {
      fetchData();
      return () => {
        setData([]);
      };
    }, []);
    return (
      <WrappedComponent apiData={data} label={label} {...props} />
    );
  };
  Component.displayName = 'test';
  return Component;
};
