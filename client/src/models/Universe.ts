import type { Franchise } from './Franchise';

// Base interface with ObjectId references (as stored in database)
export interface Universe {
  _id: string;
  name: string;
  franchises: string[]; // Array of ObjectId references
}

// Populated interface with full objects
export interface UniversePopulated {
  _id: string;
  name: string;
  franchises: Franchise[]; // Array of populated franchise objects
}

// Create/Update interface (without _id)
export interface UniverseInput {
  name: string;
  franchises?: string[];
}
