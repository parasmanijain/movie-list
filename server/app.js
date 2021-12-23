require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const country_controller = require('./controllers/country');
const language_controller = require('./controllers/language');
const director_controller = require('./controllers/director');
const genre_controller = require('./controllers/genre');
const franchise_controller = require('./controllers/franchise');
const universe_controller = require('./controllers/universe');
const category_controller = require('./controllers/category');
const award_controller = require('./controllers/award');
const movie_controller = require('./controllers/movie');

app.get('/languages', language_controller.getLanguageList);
app.get('/topLanguage', language_controller.getTopLanguage);
app.get('/languagesCount', language_controller.getLanguageCount);
app.post('/language', language_controller.addNewLanguage);

app.get('/genres', genre_controller.getGenreList);
app.get('/topGenre', genre_controller.getTopGenre);
app.get('/genresCount', genre_controller.getGenreCount);
app.post('/genre', genre_controller.addNewGenre);

app.get('/franchises', franchise_controller.getFranchiseList);
app.get('/topFranchise', franchise_controller.getTopFranchise);
app.get('/franchisesCount', franchise_controller.getFranchiseCount);
app.post('/franchise', franchise_controller.addNewFranchise);

app.get('/universes', universe_controller.getUniverseList);
app.get('/universeFranchises', universe_controller.getUniverseFranchiseList);
app.get('/universesCount', universe_controller.getUniverseCount);
app.post('/universe', universe_controller.addNewUniverse);

app.get('/countries', country_controller.getCountryList);
app.post('/country', country_controller.addNewCountry);

app.get('/directors', director_controller.getDirectorList);
app.get('/topDirector', director_controller.getTopDirector);
app.get('/directorsCount', director_controller.getDirectorCount);
app.post('/director', director_controller.addNewDirector);

app.get('/movies', movie_controller.getMovieList);
app.get('/movieDetails', movie_controller.getMovieDetails);
app.get('/topMovie', movie_controller.getTopMovie);
app.get('/movieAwards', movie_controller.getMovieAwards);
app.post('/movie',movie_controller.addNewMovie);
app.post('/updateMovie', movie_controller.updateExistingMovie);
app.get('/topYear', movie_controller.getTopYear);
app.get('/yearsCount', movie_controller.getYearCount);


app.get('/categories', category_controller.getCategoryList);
app.get('/topCategory', category_controller.getTopCategory);
app.get('/categoriesCount', category_controller.getCategoryCount);
app.post('/category', category_controller.addNewCategory);

app.get('/awards', award_controller.getAwardList);
app.get('/awardCategories', award_controller.getAwardCategoryList);
app.get('/awardsCount', award_controller.getAwardCount);
app.post('/award', award_controller.addNewAward);

function setupCORS(req, res, next) {
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key');
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
    } else {
        next();
    }
}

app.all('/*', setupCORS);
app.listen(process.env.API_PORT, () => {
    console.log(`Server has started at ${process.env.API_PORT}`)
});