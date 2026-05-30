import { Box, LinearProgress } from '@mui/material';
import { axiosConfig } from '../../helper';
import { useEffect, useState, useRef } from 'react';
import type { ComponentType } from 'react';
import axios from 'axios';

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
    const [error, setError] = useState<string | null>(null);
    // Use a ref to track if the component is still mounted
    const isMountedRef = useRef(true);

    useEffect(() => {
      isMountedRef.current = true;
      // Create an AbortController for cancelling the request on unmount
      const abortController = new AbortController();

      const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await axiosConfig.get(apiUrl, {
            signal: abortController.signal
          });
          if (isMountedRef.current) {
            setData(response.data);
          }
        } catch (err) {
          if (axios.isCancel(err)) {
            // Request was cancelled — not an error
            return;
          }
          if (isMountedRef.current) {
            setError('Failed to load data. Please try again.');
            console.error('[getData HOC] Fetch error:', err);
          }
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isMountedRef.current = false;
        abortController.abort();
      };
    }, []);

    if (loading) {
      return (
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
      );
    }

    if (error) {
      return (
        <Box
          sx={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          {error}
        </Box>
      );
    }

    return <WrappedComponent apiData={data} title={title} {...props} />;
  };

  Component.displayName = `getData(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  return Component;
};
