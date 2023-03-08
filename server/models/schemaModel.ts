import { model, Schema } from 'mongoose';
import { mongoose } from '../database';

const languageSchema: Schema = new Schema({
  name: { type: String, unique: true },
  code: { type: String, unique: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

const franchiseSchema = new Schema({
  name: { type: String },
  universe: { type: Schema.Types.ObjectId, ref: 'Universe', required: false },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

const universeSchema = new Schema({
  name: { type: String, unique: true },
  franchises: [{ type: Schema.Types.ObjectId, ref: 'Franchise' }]
});

const categorySchema = new Schema({
  name: { type: String },
  award: { type: Schema.Types.ObjectId, ref: 'Award', required: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

const awardSchema = new Schema({
  name: { type: String, unique: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

const genreSchema = new Schema({
  name: { type: String, unique: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

const directorSchema = new Schema({
  name: { type: String, unique: true },
  url: { type: String, unique: true },
  country: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

const countrySchema = new Schema({
  name: { type: String, unique: true }
});

const movieSchema = new Schema({
  name: { type: String },
  language: [{ type: Schema.Types.ObjectId, ref: 'Language' }],
  director: [{ type: Schema.Types.ObjectId, ref: 'Director' }],
  year: { type: String },
  url: { type: String },
  imdb: { type: String },
  rottenTomatoes: { type: String, required: false },
  franchise: { type: Schema.Types.ObjectId, ref: 'Franchise', required: false },
  genre: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
  category: [{ type: Schema.Types.ObjectId, ref: 'Category', required: false }]
});

languageSchema.index({ name: 1, code: 1 }, { unique: true });
directorSchema.index({ name: 1, country: 1, url: 1 }, { unique: true });
movieSchema.index({ name: 1, year: 1, url: 1, imdb: 1, rottenTomatoes: 1 }, { unique: true });

export const Language = model('Language', languageSchema);
export const Country = model('Country', countrySchema);

export const Director = model('Director', directorSchema);
export const Movie = model('Movie', movieSchema);
export const Genre = model('Genre', genreSchema);
export const Franchise = model('Franchise', franchiseSchema);
export const Universe = model('Universe', universeSchema);
export const Category = model('Category', categorySchema);
export const Award = model('Award', awardSchema);
