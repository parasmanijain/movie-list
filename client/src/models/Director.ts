import { Schema } from 'mongoose';

export interface Director {
  _id: Schema.Types.ObjectId;
  name: string;
  url: string;
  country: string[];
  movies: Schema.Types.ObjectId[];
}
