import { Schema, model } from 'mongoose';

const categorySchema = new Schema({
  name: { type: String },
  award: { type: Schema.Types.ObjectId, ref: 'Award', required: true },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

export const Category = model('Category', categorySchema);
