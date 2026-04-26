import type { Category } from './Category';

// Base interface with ObjectId references (as stored in database)
export interface Award {
  _id: string;
  name: string;
  categories: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface AwardPopulated {
  _id: string;
  name: string;
  categories: Category[]; // Array of populated category objects
}

// Create/Update interface (without _id)
export interface AwardInput {
  name: string;
  categories?: string[];
}
