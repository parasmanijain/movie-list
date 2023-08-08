import { Schema } from 'mongoose';

export interface Genre {
  _id: Schema.Types.ObjectId;
  name: string;
  movies: Schema.Types.ObjectId[];
}
