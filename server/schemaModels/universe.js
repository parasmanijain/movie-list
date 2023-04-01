import { Schema, model } from 'mongoose';

const universeSchema = new Schema({
  name: { type: String, unique: true },
  franchises: [{ type: Schema.Types.ObjectId, ref: 'Franchise' }]
});

export const Universe = model('Universe', universeSchema);
