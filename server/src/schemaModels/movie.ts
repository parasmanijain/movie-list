import { Schema, model } from 'mongoose';

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

movieSchema.index({ name: 1, year: 1, url: 1, imdb: 1, rottenTomatoes: 1 }, { unique: true });

export const Movie = model('Movie', movieSchema);
