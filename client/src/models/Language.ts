import type { Movie } from './Movie';

// Base interface with ObjectId references (as stored in database)
export interface Language {
  _id: string;
  name: string;
  code: string;
  movies: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface LanguagePopulated {
  _id: string;
  name: string;
  code: string;
  movies: Movie[]; // Array of populated movie objects
}

// Create/Update interface (without _id)
export interface LanguageInput {
  name: string;
  code: string;
  movies?: string[];
}
