import type { Country } from './Country';
import type { Movie } from './Movie';

// Base interface with ObjectId references (as stored in database)
export interface Director {
  _id: string;
  name: string;
  url: string;
  country: string[]; // Array of ObjectId references
  movies: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface DirectorPopulated {
  _id: string;
  name: string;
  url: string;
  country: Country[]; // Array of populated country objects
  movies: Movie[]; // Array of populated movie objects
}

// Create/Update interface (without _id)
export interface DirectorInput {
  name: string;
  url: string;
  country?: string[];
  movies?: string[];
}
