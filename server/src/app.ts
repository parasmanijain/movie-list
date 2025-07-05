import 'dotenv/config';
import express, { json, urlencoded, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { connect } from 'mongoose';

// Connect to the database
connect(process.env.DATABASE_URL as string);

// Initialize Express app
const app = express();

// Middleware setup
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Import controllers
import { getCountryList, addNewCountry } from './controllers/country';
import {
  getLanguageList,
  getTopLanguage,
  getLanguageCount,
  addNewLanguage
} from './controllers/language';
import {
  getDirectorList,
  getTopDirector,
  getDirectorCount,
  addNewDirector,
  getMovieCount
} from './controllers/director';
import { getGenreList, getTopGenre, getGenreCount, addNewGenre } from './controllers/genre';
import {
  getFranchiseList,
  getTopFranchise,
  getFranchiseCount,
  addNewFranchise
} from './controllers/franchise';
import {
  getUniverseList,
  getUniverseFranchiseList,
  getUniverseCount,
  addNewUniverse
} from './controllers/universe';
import {
  getCategoryList,
  getTopCategory,
  getCategoryCount,
  addNewCategory
} from './controllers/category';
import {
  getAwardList,
  getAwardCategoryList,
  getAwardCount,
  addNewAward
} from './controllers/award';
import {
  getMovieList,
  getMovieDetails,
  getTopMovie,
  getMovieAwards,
  addNewMovie,
  updateExistingMovie,
  getTopYear,
  getYearCount
} from './controllers/movie';

// Define routes
app.get('/languages', getLanguageList);
app.get('/topLanguage', getTopLanguage);
app.get('/languagesCount', getLanguageCount);
app.post('/language', addNewLanguage);

app.get('/genres', getGenreList);
app.get('/topGenre', getTopGenre);
app.get('/genresCount', getGenreCount);
app.post('/genre', addNewGenre);

app.get('/franchises', getFranchiseList);
app.get('/topFranchise', getTopFranchise);
app.get('/franchisesCount', getFranchiseCount);
app.post('/franchise', addNewFranchise);

app.get('/universes', getUniverseList);
app.get('/universeFranchises', getUniverseFranchiseList);
app.get('/universesCount', getUniverseCount);
app.post('/universe', addNewUniverse);

app.get('/countries', getCountryList);
app.post('/country', addNewCountry);

app.get('/directors', getDirectorList);
app.get('/topDirector', getTopDirector);
app.get('/directorsCount', getDirectorCount);
app.post('/director', addNewDirector);
app.get('/moviesCount', getMovieCount);

app.get('/movies', getMovieList);
app.get('/movieDetails', getMovieDetails);
app.get('/topMovie', getTopMovie);
app.get('/movieAwards', getMovieAwards);
app.post('/movie', addNewMovie);
app.post('/updateMovie', updateExistingMovie);
app.get('/topYear', getTopYear);
app.get('/yearsCount', getYearCount);

app.get('/categories', getCategoryList);
app.get('/topCategory', getTopCategory);
app.get('/categoriesCount', getCategoryCount);
app.post('/category', addNewCategory);

app.get('/awards', getAwardList);
app.get('/awardCategories', getAwardCategoryList);
app.get('/awardsCount', getAwardCount);
app.post('/award', addNewAward);

// CORS setup function
function setupCORS(req: Request, res: Response, next: NextFunction) {
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key'
  );
  res.header('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
}

// Apply CORS setup
app.all(/.*/, setupCORS);

// Start the server
app.listen(process.env.API_PORT, () => {
  console.log(`Server has started at ${process.env.API_PORT}`);
});
