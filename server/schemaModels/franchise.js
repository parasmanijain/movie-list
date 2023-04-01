import { Schema, model } from 'mongoose';

const franchiseSchema = new Schema({
  name: { type: String },
  universe: { type: Schema.Types.ObjectId, ref: 'Universe', required: false },
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }]
});

export const Franchise = model('Franchise', franchiseSchema);
