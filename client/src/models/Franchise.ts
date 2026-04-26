import type { Universe } from './Universe';
import type { Movie } from './Movie';

// Base interface with ObjectId references (as stored in database)
export interface Franchise {
  _id: string;
  name: string;
  universe?: string; // ObjectId reference - optional as per schema
  movies: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface FranchisePopulated {
  _id: string;
  name: string;
  universe?: Universe; // Populated universe object
  movies: Movie[]; // Array of populated movie objects
}

// Create/Update interface (without _id)
export interface FranchiseInput {
  name: string;
  universe?: string;
  movies?: string[];
}
