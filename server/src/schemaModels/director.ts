import { Schema, model } from 'mongoose';

const directorSchema = new Schema({
  name: { type: String, unique: true },
  url: { type: String, unique: true },
  country: [{ type: Schema.Types.ObjectId, ref: 'Country' }],
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

directorSchema.index({ name: 1, country: 1, url: 1 }, { unique: true });

export const Director = model('Director', directorSchema);
