import { AddNewCountry, AddNewDirector, AddNewFranchise, AddNewGenre, AddNewLanguage, AddNewMovie, AddNewUniverse, Director,
  Franchise, Genre, Home, Language, TopRatedMovies, Year, Universe } from '../components';

export const routes = [
  {
    'path': '/',
    'label': 'Home',
    'production': true,
    'component': Home
  }, {
    'path': '/language',
    'label': 'Language',
    'production': true,
    'component': Language
  },
  {
    'path': '/director',
    'label': 'Director',
    'production': true,
    'component': Director
  },
  {
    'path': '/genre',
    'label': 'Genre',
    'production': true,
    'component': Genre
  },
  {
    'path': '/year',
    'label': 'Year',
    'production': true,
    'component': Year
  },
  {
    'path': '/franchise',
    'label': 'Franchise',
    'production': true,
    'component': Franchise
  },
  {
    'path': '/universe',
    'label': 'Universe',
    'production': true,
    'component': Universe
  },
  {
    'path': '/top-rated-movies',
    'label': 'Top Rated Movies',
    'production': true,
    'component': TopRatedMovies
  },
  {
    'path': '/add-new-country',
    'label': 'Add New Country',
    'production': false,
    'component': AddNewCountry
  }, {
    'path': '/add-new-language',
    'label': 'Add New Language',
    'production': false,
    'component': AddNewLanguage
  }, {
    'path': '/add-new-genre',
    'label': 'Add New Genre',
    'production': false,
    'component': AddNewGenre
  }, {
    'path': '/add-new-universe',
    'label': 'Add New Universe',
    'production': false,
    'component': AddNewUniverse
  }, {
    'path': '/add-new-director',
    'label': 'Add New Director',
    'production': false,
    'component': AddNewDirector
  },
  {
    'path': '/add-new-franchise',
    'label': 'Add New Franchise',
    'production': false,
    'component': AddNewFranchise
  },
  {
    'path': '/add-new-movie',
    'label': 'Add New Movie',
    'production': false,
    'component': AddNewMovie
  }];
