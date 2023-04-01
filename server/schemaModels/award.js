import { Schema, model } from 'mongoose';

const awardSchema = new Schema({
  name: { type: String, unique: true },
  categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }]
});

export const Award = model('Award', awardSchema);
