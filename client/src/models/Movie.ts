import type { Language } from './Language';
import type { Director } from './Director';
import type { Franchise } from './Franchise';
import type { Genre } from './Genre';
import type { Category } from './Category';

// Base interface with ObjectId references (as stored in database)
export interface Movie {
  _id: string;
  name: string;
  language: string[]; // Array of ObjectId references
  director: string[]; // Array of ObjectId references
  year: string;
  url: string;
  imdb: string;
  rottenTomatoes?: string; // Optional field
  franchise?: string; // ObjectId reference - optional
  genre: string[]; // Array of ObjectId references
  category?: string[]; // Array of ObjectId references - optional
}

// Populated interface with full objects
export interface MoviePopulated {
  _id: string;
  name: string;
  language: Language[]; // Array of populated language objects
  director: Director[]; // Array of populated director objects
  year: string;
  url: string;
  imdb: string;
  rottenTomatoes?: string;
  franchise?: Franchise; // Populated franchise object
  genre: Genre[]; // Array of populated genre objects
  category?: Category[]; // Array of populated category objects
}

// Create/Update interface (without _id)
export interface MovieInput {
  name: string;
  language: string[];
  director: string[];
  year: string;
  url: string;
  imdb: string;
  rottenTomatoes?: string;
  franchise?: string;
  genre: string[];
  category?: string[];
}
