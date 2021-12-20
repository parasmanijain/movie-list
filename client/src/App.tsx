import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link, RouteProps
} from 'react-router-dom';
import './App.css';
import { AppBar, Box, Tab, Tabs } from './components/lib';
import { ProtectedRoute, routes } from './components';

interface PublicRouteProps extends RouteProps {
  component: any;
  path:any;
}

export const App = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [environment] = useState((process.env.NODE_ENV));
  const [value, setValue] = useState('/');

  const renderTabs = (label, value, index) => <Tab key={index} value={value} label={label} component={Link} to={value}/>;

  const handleMovieUpdateSelection = (movie) => {
    setSelectedMovie(movie);
  };

  const renderRoutes = (index, production, props:PublicRouteProps ) => {
    // eslint-disable-next-line react/prop-types
    const { component: Component, path } = props;
    let componentProps = {};
    if (!production) {
      if (path === '/add-new-movie') {
        componentProps = { selectedMovie: selectedMovie };
      }
      return (<Route key = {index} path={path} element={<ProtectedRoute/>}>
        <Route path={path} element = {<Component { ...componentProps}/>}/>
      </Route>);
    } else {
      if (path === '/') {
        componentProps = { handleMovieUpdateSelection: handleMovieUpdateSelection };
      }
      return (<Route key = {index} path={path} element = {<Component { ...componentProps}/>}/>);
    }
  };
  const handleChange = (event, newValue) => {
    setValue(newValue);
    // navigate(newValue);
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
        >{
            routes.map((ele, index) => environment.toLowerCase() !== 'development' && !ele.production? null :
                renderTabs(ele.label, ele.path, index))
          }
        </Tabs>
      </AppBar>
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Box sx={{ marginTop: '40px', padding: '8px', boxSizing: 'border-box', height: '100%', width: '100%' }}>
        <Routes>
          { routes.map((ele, index) => {
            const routeProps:PublicRouteProps = {
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
