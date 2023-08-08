import { Schema } from 'mongoose';

export interface Award {
  _id: Schema.Types.ObjectId;
  name: string;
  categories: Schema.Types.ObjectId[];
}
