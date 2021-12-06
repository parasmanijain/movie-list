import React, { useState } from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from 'react-router-dom';
import './App.css';

import { Home } from './components/Home';

import { AddNewMovie } from './components/AddNewMovie';
import { AddNewDirector } from './components/AddNewDirector';
import { AddNewCountry } from './components/AddNewCountry';
import { AddNewLanguage } from './components/AddNewLanguage';
import { TopRatedMovies } from './components/TopRatedMovies';
import { AppBar, Box, Tab, Tabs } from '@mui/material';

import Genre from './components/Genre';
import Language from './components/Language';
import Director from './components/Director';
import Year from './components/Year';
import Franchise from './components/Franchise';
import { Universe } from './components/Universe';
import { AddNewGenre } from './components/AddNewGenre';
import { AddNewFranchise } from './components/AddNewFranchise';
import { AddNewUniverse } from './components/AddNewUniverse';

export const App = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);

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
              <Tab
                value="/"
                label="Home"
                component={Link}
                to="/"
              />
              <Tab
                value="/language"
                label="Language"
                component={Link}
                to="/language"
              />
              <Tab
                value="/director"
                label="Director"
                component={Link}
                to="/director"
              />
              <Tab
                value="/genre"
                label="Genre"
                component={Link}
                to="/genre"
              />
              <Tab
                value="/year"
                label="Year"
                component={Link}
                to="/year"
              />
              <Tab
                value="/franchise"
                label="Franchise"
                component={Link}
                to="/franchise"
              />
              <Tab
                value="/universe"
                label="Universe"
                component={Link}
                to="/universe"
              />
              <Tab
                value="/top-rated-movies"
                label="Top Rated Movies"
                component={Link}
                to="/top-rated-movies"
              />
              <Tab
                value="/add-new-country"
                label="Add New Country"
                component={Link}
                to="/add-new-country"
              />
              <Tab
                value="/add-new-director"
                label="Add New Director"
                component={Link}
                to="/add-new-director"
              />
              <Tab
                value="/add-new-language"
                label="Add New Language"
                component={Link}
                to="/add-new-language"
              />
              <Tab
                value="/add-new-genre"
                label="Add New Genre"
                component={Link}
                to="/add-new-genre"
              />
              <Tab
                value="/add-new-franchise"
                label="Add New Franchise"
                component={Link}
                to="/add-new-franchise"
              />
              <Tab
                value="/add-new-universe"
                label="Add New Universe"
                component={Link}
                to="/add-new-universe"
              />
              <Tab
                value="/add-new-movie"
                label="Add New Movie"
                component={Link}
                to="/add-new-movie"
              />
            </Tabs>
          </AppBar>
        )}
      />
      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Box sx={{ marginTop: '40px', padding: '8px', boxSizing: 'border-box', height: '100%', width: '100%' }}>

        <Switch>
          <Route path="/language" component={Language} />
          <Route path="/director" component={Director} />
          <Route path="/genre" component={Genre} />
          <Route path="/year" component={Year} />
          <Route path="/franchise" component={Franchise} />
          <Route path="/universe" component={Universe} />
          <Route path="/top-rated-movies" component={TopRatedMovies} />
          <Route path="/add-new-director" component={AddNewDirector} />
          <Route path="/add-new-language" component={AddNewLanguage} />
          <Route path="/add-new-genre" component={AddNewGenre} />
          <Route path="/add-new-franchise" component={AddNewFranchise} />
          <Route path="/add-new-universe" component={AddNewUniverse} />
          <Route path="/add-new-movie" render={() => <AddNewMovie selectedMovie = {selectedMovie} />} />
          <Route path="/add-new-country" component={AddNewCountry} />
          <Route path="/" render={() => <Home handleMovieUpdateSelection = {handleMovieUpdateSelection} />} />
        </Switch>
      </Box>
    </BrowserRouter>
  );
};


