import { Schema, model } from 'mongoose';

const languageSchema = new Schema({
  name: { type: String, unique: true },
  code: { type: String, unique: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

languageSchema.index({ name: 1, code: 1 }, { unique: true });

export const Language = model('Language', languageSchema);
