import React, { useState } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link, RouteProps
} from 'react-router-dom';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import { AddNewMovie, Home } from './components';
import { AppBar, Box, Tab, Tabs } from './lib';
import { routes } from './helper/routes';

interface PublicRouteProps extends RouteProps {
  component: any;
  path:any;
}

export const App = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [environment] = useState((process.env.NODE_ENV));
  const tabs = [{
    'value': '/',
    'label': 'Home'
  }];

  const devTabs = [
    {
      'value': '/add-new-movie',
      'label': 'Add New Movie'
    }];


  const renderTabs = (label, value, index) => <Tab key={index} value={value} label={label} component={Link} to={value}/>;

  const renderRoutes = (index, production, props:PublicRouteProps ) => {
    // eslint-disable-next-line react/prop-types
    const { component: Component, path } = props;
    if (!production) {
      return (<ProtectedRoute key = {index} exact = {true} path={path}
        render={() => <Component />} />);
    } else {
      return (<Route key = {index} exact = {true} path={path}
        render={() => <Component />} />);
    }
  };

  const handleMovieUpdateSelection = (movie) => {
    setSelectedMovie(movie);
  };
  return (
    <BrowserRouter>
      <Route
        path="/"
        render={(history) => (
          <AppBar sx={{ height: '40px' }}>
            <Tabs
              textColor="secondary"
              indicatorColor="secondary"
              variant="scrollable"
              scrollButtons="auto"
              value={
                history.location.pathname !== '/' ?
                  history.location.pathname :
                  false
              }
            >
              {
                tabs.map((ele, index) => renderTabs(ele.label, ele.value, index))
              }
              {
                routes.map((ele, index) => environment.toLowerCase() !== 'development' && !ele.production? null :
                renderTabs(ele.label, ele.path, index))
              }
              { environment.toLowerCase() === 'development' &&
              devTabs.map((ele, index)=> renderTabs(ele.label, ele.value, index))}
            </Tabs>
          </AppBar>
        )}
      />
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Box sx={{ marginTop: '40px', padding: '8px', boxSizing: 'border-box', height: '100%', width: '100%' }}>
        <Switch>
          { routes.map((ele, index) => {
            const routeProps:PublicRouteProps = {
              path: ele.path,
              component: ele.component
            };
            return renderRoutes(index, ele.production, routeProps);
          })}
          <Route exact = {true} path="/" render={() => <Home handleMovieUpdateSelection = {handleMovieUpdateSelection} />} />
          <ProtectedRoute path="/add-new-movie" render={() => <AddNewMovie selectedMovie = {selectedMovie} />} />
        </Switch>
      </Box>
    </BrowserRouter>
  );
};


