import { useState } from 'react';
import type { SetStateAction, ReactElement } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import { ProtectedRoute, routes } from './components';
import type { routeProps } from './components/routes/routes';
import { AppBar, Box, Tab, Tabs } from '@mui/material';

const currentTab = () => {
  const pathname = window.location.pathname;

  // Handle root path redirect
  if (pathname === '/') {
    return '/home';
  }

  if (import.meta.env.NODE_ENV === 'production') {
    const route = routes.find((ele: routeProps) => ele.path === pathname);
    if (route && !route.production) {
      return '/home';
    }
  }
  return pathname;
};

export const App = (): ReactElement => {
  const [selectedMovie, setSelectedMovie] = useState<string | null>(null);
  const [environment] = useState(import.meta.env.NODE_ENV || 'development'); // Default to 'development'
  const [value, setValue] = useState(currentTab());

  const renderTabs = (label: string, value: string, index: number) => (
    <Tab
      key={index}
      value={value}
      label={label}
      component={Link}
      to={value}
      sx={{ px: 1, py: `0px !important` }}
    />
  );

  const handleMovieUpdateSelection = (movie: string) => {
    setSelectedMovie(movie);
  };

  const renderRoutes = (index: number, production: boolean, route: routeProps) => {
    const { component: FC, path } = route;
    let componentProps = {};
    if (!production) {
      if (path === '/add-new-movie') {
        componentProps = { selectedMovie: selectedMovie };
      }
      return (
        <Route key={index} path={path} element={<ProtectedRoute />}>
          <Route path={path} element={<FC {...componentProps} />} />
        </Route>
      );
    } else {
      if (path.includes('/home')) {
        componentProps = { handleMovieUpdateSelection: handleMovieUpdateSelection };
      }
      return <Route key={index} path={path} element={<FC {...componentProps} />} />;
    }
  };

  const handleChange = (_: any, newValue: SetStateAction<string>) => {
    setValue(newValue);
  };

  return (
    <BrowserRouter>
      <AppBar sx={{ height: '40px' }}>
        <Tabs
          textColor="secondary"
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons="auto"
          onChange={handleChange}
          value={value}
          sx={{ minHeight: '40px' }}
        >
          {routes.map((ele, index) =>
            environment?.toLowerCase() !== 'development' && !ele.production
              ? null
              : renderTabs(ele.label, ele.path, index)
          )}
        </Tabs>
      </AppBar>
      <Box
        sx={{
          position: 'absolute',
          top: '40px',
          boxSizing: 'border-box',
          height: '100%',
          width: '100%'
        }}
      >
        <Routes>
          {routes.map((route: routeProps, index) => {
            const { production } = route;
            return renderRoutes(index, production, route);
          })}
          <Route path="/" element={<Navigate to={routes[0]?.path || '/home'} replace />} />
          <Route path="*" element={<Navigate to={routes[0]?.path || '/home'} replace />} />
        </Routes>
      </Box>
    </BrowserRouter>
  );
};
