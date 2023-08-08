import { Schema } from 'mongoose';

export interface Category {
  _id: Schema.Types.ObjectId;
  name: string;
  award: Schema.Types.ObjectId;
  movies: Schema.Types.ObjectId[];
}
