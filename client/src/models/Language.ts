import { Schema } from 'mongoose';

export interface Language {
  _id: Schema.Types.ObjectId;
  name: string;
  code: string;
  movies: Schema.Types.ObjectId[];
}
