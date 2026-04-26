import type { Award } from './Award';
import type { Movie } from './Movie';

// Base interface with ObjectId references (as stored in database)
export interface Category {
  _id: string;
  name: string;
  award: string; // ObjectId reference - required as per schema
  movies: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface CategoryPopulated {
  _id: string;
  name: string;
  award: Award; // Populated award object
  movies: Movie[]; // Array of populated movie objects
}

// Create/Update interface (without _id)
export interface CategoryInput {
  name: string;
  award: string; // Required field
  movies?: string[];
}
