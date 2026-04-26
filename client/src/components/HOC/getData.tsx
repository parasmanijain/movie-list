import { Box, LinearProgress } from '@mui/material';
import { axiosConfig } from '../../helper';
import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';

interface GetDataProps {
  apiUrl: string;
  title: string;
  [key: string]: unknown;
}

interface WrappedComponentProps {
  apiData: unknown[];
  title: string;
  [key: string]: unknown;
}

export const getData = (
  WrappedComponent: ComponentType<WrappedComponentProps>,
  { apiUrl, title, ...props }: GetDataProps
): React.FC => {
  const Component = () => {
    const [data, setData] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(false);
    const fetchData = () => {
      const list = axiosConfig.get(apiUrl);
      setLoading(true);
      Promise.all([list])
        .then((responses) => {
          setLoading(false);
          setData(responses[0].data);
        })
        .catch((errors) => {
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
    return loading ? (
      <Box
        sx={{
          height: '100vh',
          width: '100vw',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <LinearProgress />
      </Box>
    ) : (
      <WrappedComponent apiData={data} title={title} {...props} />
    );
  };
  Component.displayName = 'test';
  return Component;
};
