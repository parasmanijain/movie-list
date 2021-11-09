import React from 'react';
import {
  BrowserRouter,
  Switch,
  Route,
  Link
} from "react-router-dom";
import './App.css';
import { Language } from './components/Language';
import { Home } from './components/Home';
import { Director } from './components/Director';
import { AddNewMovie } from './components/AddNewMovie';
import { AddNewDirector } from './components/AddNewDirector';
import { AddNewCountry } from './components/AddNewCountry';
import { AddNewLanguage } from './components/AddNewLanguage';
import { EditMovieDetails } from './components/EditMovieDetails';
import { TopRatedMovies } from './components/TopRatedMovies';
import { AppBar, Box, Tab, Tabs } from '@mui/material';

function App() {
  return (
    <BrowserRouter>
     <Route
          path="/"
          render={(history) => (
            <AppBar sx={{ height:'40px'}}>
              <Tabs
              textColor="secondary"
              indicatorColor="secondary"
                value={
                  history.location.pathname !== "/"
                    ? history.location.pathname
                    : false
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
                  value="/add-new-movie"
                  label="Add New Movie"
                  component={Link}
                  to="/add-new-movie"
                />
                <Tab
                  value="/edit-movie-details/:movieID"
                  label="Edit Movie Details"
                  component={Link}
                  to="/edit-movie-details/:movieID"
                />
                 <Tab
                  value="/top-rated-movies"
                  label="Top Rated Movies"
                  component={Link}
                  to="/top-rated-movies"
                />
              </Tabs>
            </AppBar>
          )}
        />
        {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
          <Box sx={{ marginTop:"40px", padding:"20px", boxSizing:"border-box", height:"100%", width:"100%"}}>

        <Switch>
          <Route path="/language" component={Language} />
          <Route path="/director" component={Director} />
          <Route path="/add-new-director" component={AddNewDirector} />
          <Route path="/add-new-language" component={AddNewLanguage} />
          <Route path="/add-new-movie" component={AddNewMovie} />
          <Route path="/add-new-country" component={AddNewCountry}/>
          <Route path="/edit-movie-details/:movieID" component={EditMovieDetails}/>
          <Route path="/top-rated-movies" component={TopRatedMovies}/>
          <Route path="/" component={Home}/>
        </Switch>
        </Box>
    </BrowserRouter>


  );
}

export default App;
