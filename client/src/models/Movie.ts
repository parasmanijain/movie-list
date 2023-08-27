import { Schema } from 'mongoose';

export interface Movie {
  _id: Schema.Types.ObjectId;
  name: string;
  language: Schema.Types.ObjectId[];
  director: Schema.Types.ObjectId[];
  year: string;
  url: string;
  imdb: string;
  rottenTomatoes?: string;
  franchise?: Schema.Types.ObjectId | string;
  genre: Schema.Types.ObjectId[];
  category?: Schema.Types.ObjectId[];
}
