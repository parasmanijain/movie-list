const mongoose = require('../database');

const languageSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    code: { type: String, unique: true },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const franchiseSchema = new mongoose.Schema({
    name: { type: String },
    universe: { type: mongoose.Schema.Types.ObjectId, ref: 'Universe', required: false },  
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const universeSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    franchises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Franchise' }]
});

const categorySchema = new mongoose.Schema({
    name:{ type: String },
    award: { type: mongoose.Schema.Types.ObjectId, ref: 'Award', required: true },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const awardSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
});

const genreSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const directorSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    url: { type: String, unique: true },
    country: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const countrySchema = new mongoose.Schema({
    name: { type: String, unique: true },
});

const movieSchema = new mongoose.Schema({
    name: { type: String},
    language: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],
    director: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Director' }],
    year: { type: String },
    url: { type: String },
    imdb: { type: String },
    rottenTomatoes: { type: String, required: false },
    franchise: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchise', required: false },
    genre: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Genre' }],
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: false }],
});

languageSchema.index({ name: 1, code: 1 }, { unique: true });
directorSchema.index({ name: 1, country: 1, url: 1 }, { unique: true });
movieSchema.index({ name: 1, year: 1, url: 1, imdb: 1, rottenTomatoes: 1 }, { unique: true });

module.exports = {
    Language : mongoose.model('Language', languageSchema),
    Country : mongoose.model('Country', countrySchema),
    Director : mongoose.model('Director', directorSchema),
    Movie : mongoose.model('Movie', movieSchema),
    Genre : mongoose.model('Genre', genreSchema),
    Franchise : mongoose.model('Franchise', franchiseSchema),
    Universe: mongoose.model('Universe', universeSchema),
    Category : mongoose.model('Category', categorySchema),
    Award: mongoose.model('Award', awardSchema)
}