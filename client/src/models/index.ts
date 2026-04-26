// Export all model interfaces and types
export type { Award, AwardPopulated, AwardInput } from './Award';
export type { Category, CategoryPopulated, CategoryInput } from './Category';
export type { Country } from './Country';
export type { Director, DirectorPopulated, DirectorInput } from './Director';
export type { Franchise, FranchisePopulated, FranchiseInput } from './Franchise';
export type { Genre, GenrePopulated, GenreInput } from './Genre';
export type { Language, LanguagePopulated, LanguageInput } from './Language';
export type { Movie, MoviePopulated, MovieInput } from './Movie';
export type { Universe, UniversePopulated, UniverseInput } from './Universe';

// Common utility types for API responses
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  error?: string;
}

// Common entity operations
export interface EntityOperations {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: string | string[] | number | boolean | undefined;
}