import { Schema } from 'mongoose';

export interface Franchise {
  _id: Schema.Types.ObjectId;
  name: string;
  universe: Schema.Types.ObjectId;
  movies: Schema.Types.ObjectId[];
}
