import React from 'react';
import {
  BrowserRouter as Router,
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

function App() {
  return (
    <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/language">Language</Link>
          </li>          
          <li>
            <Link to="/director">Director</Link>
          </li>
          <li>
            <Link to="/add-new-country">Add New Country</Link>
          </li>
          <li>
            <Link to="/add-new-director">Add New Director</Link>
          </li>
          <li>
            <Link to="/add-new-language">Add New Language</Link>
          </li>
          <li>
            <Link to="/add-new-movie">Add New Movie</Link>
          </li>
          <li>
            <Link to="/edit-movie-details/:movieID">Edit Movie Details</Link>
          </li>
          <li>
            <Link to="/top-rated-movies">Top Rated Movies</Link>
          </li>
        </ul>
      </nav>

      {/* A <Switch> looks through its children <Route>s and
          renders the first one that matches the current URL. */}
      <Switch>
        <Route path="/language">
          <Language />
        </Route>        
        <Route path="/director">
          <Director />
        </Route>
        <Route path="/add-new-director">
          <AddNewDirector />
        </Route>
        <Route path="/add-new-language">
          <AddNewLanguage />
        </Route>           
        <Route path="/add-new-movie">
          <AddNewMovie/>
        </Route>
        <Route path="/add-new-country">
          <AddNewCountry/>
        </Route>
        <Route path="/edit-movie-details/:movieID">
          <EditMovieDetails/>
        </Route>
        <Route path="/top-rated-movies">
          <TopRatedMovies/>
        </Route>
        <Route path="/">
          <Home />
        </Route>
      </Switch>
    </div>
  </Router>
  
  
  );
}

export default App;
