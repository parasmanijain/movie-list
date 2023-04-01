import { Schema, model } from 'mongoose';

const countrySchema = new Schema({
  name: { type: String, unique: true }
});

export const Country = model('Country', countrySchema);
