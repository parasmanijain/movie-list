import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AppBar, Box, Tab, Tabs } from './components/lib';
import { ProtectedRoute, routes } from './components';

const currentTab = () => {
  if (process.env.NODE_ENV === 'production') {
    const route = routes.find((ele) => ele.path === window.location.pathname);
    if (route && !route.production) {
      return '/';
    }
  }
  return window.location.pathname;
};

export const App = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [environment] = useState(process.env.NODE_ENV);
  const [value, setValue] = useState(currentTab());

  const renderTabs = (label, value, index) => (
    <Tab
      key={index}
      value={value}
      label={label}
      component={Link}
      to={value}
      sx={{ px: 1, py: `0px !important` }}
    />
  );

  const handleMovieUpdateSelection = (movie) => {
    setSelectedMovie(movie);
  };

  const renderRoutes = (index, production, props) => {
    // eslint-disable-next-line react/prop-types
    const { component: Component, path } = props;
    let componentProps = {};
    if (!production) {
      if (path === '/add-new-movie') {
        componentProps = { selectedMovie: selectedMovie };
      }
      return (
        <Route key={index} path={path} element={<ProtectedRoute />}>
          <Route path={path} element={<Component {...componentProps} />} />
        </Route>
      );
    } else {
      if (path === '/') {
        componentProps = { handleMovieUpdateSelection: handleMovieUpdateSelection };
      }
      return <Route key={index} path={path} element={<Component {...componentProps} />} />;
    }
  };

  const handleChange = (event, newValue) => {
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
            environment.toLowerCase() !== 'development' && !ele.production
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
          {routes.map((ele, index) => {
            const routeProps = {
              path: ele.path,
              component: ele.component
            };
            return renderRoutes(index, ele.production, routeProps);
          })}
        </Routes>
      </Box>
    </BrowserRouter>
  );
};
