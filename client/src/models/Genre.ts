import type { Movie } from './Movie';

// Base interface with ObjectId references (as stored in database)
export interface Genre {
  _id: string;
  name: string;
  movies: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface GenrePopulated {
  _id: string;
  name: string;
  movies: Movie[]; // Array of populated movie objects
}

// Create/Update interface (without _id)
export interface GenreInput {
  name: string;
  movies?: string[];
}
