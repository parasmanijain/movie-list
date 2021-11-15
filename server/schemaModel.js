const mongoose = require('./database');

const languageSchema = new mongoose.Schema({
    name: { type: String },
    code: { type: String },
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
const directorSchema = new mongoose.Schema({
    name: { type: String },
    url: { type: String },
    country: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Country' }],
    movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});
const countrySchema = new mongoose.Schema({
    name: { type: String },
});
const movieSchema = new mongoose.Schema({
    name: { type: String },
    language: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Language' }],
    director: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Director' }],
    year: { type: String },
    url: { type: String },
    imdb: { type: Number },
    rottenTomatoes: { type: Number }
});

directorSchema.index({ name: 1, country: 1, url: 1 }, { unique: true });
movieSchema.index({ name: 1, year: 1, url: 1, imdb: 1, rottenTomatoes: 1 }, { unique: true });

module.exports = {
    Language : mongoose.model('Language', languageSchema),
    Country : mongoose.model('Country', countrySchema),
    Director : mongoose.model('Director', directorSchema),
    Movie : mongoose.model('Movie', movieSchema)
}