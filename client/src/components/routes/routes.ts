import { AddNewCountry, AddNewDirector, AddNewFranchise, AddNewGenre, AddNewLanguage, AddNewMovie, AddNewUniverse, Director,
  Franchise, Genre, Home, Language, TopRatedMovies, Year, Universe, AddNewAward, AddNewCategory, Category, Award } from '../pages';
import DirectorMovies from '../pages/DirectorMovies';

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
    'path': '/directorMovies',
    'label': 'Movies',
    'production': true,
    'component': DirectorMovies
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
    'path': '/category',
    'label': 'Category',
    'production': true,
    'component': Category
  },
  {
    'path': '/award',
    'label': 'Award',
    'production': true,
    'component': Award
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
  },
  {
    'path': '/add-new-language',
    'label': 'Add New Language',
    'production': false,
    'component': AddNewLanguage
  },
  {
    'path': '/add-new-genre',
    'label': 'Add New Genre',
    'production': false,
    'component': AddNewGenre
  },
  {
    'path': '/add-new-universe',
    'label': 'Add New Universe',
    'production': false,
    'component': AddNewUniverse
  },
  {
    'path': '/add-new-award',
    'label': 'Add New Award',
    'production': false,
    'component': AddNewAward
  },
  {
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
    'path': '/add-new-category',
    'label': 'Add New Category',
    'production': false,
    'component': AddNewCategory
  },
  {
    'path': '/add-new-movie',
    'label': 'Add New Movie',
    'production': false,
    'component': AddNewMovie
  }];
