import { Schema, model } from 'mongoose';

const genreSchema = new Schema({
  name: { type: String, unique: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

export const Genre = model('Genre', genreSchema);
