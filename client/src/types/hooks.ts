// Custom hook types for entity management
import type {
  Movie, MoviePopulated, MovieInput,
  Director, DirectorPopulated, DirectorInput,
  Award, AwardPopulated, AwardInput,
  Category, CategoryPopulated, CategoryInput,
  Franchise, FranchisePopulated, FranchiseInput,
  Genre, GenrePopulated, GenreInput,
  Language, LanguagePopulated, LanguageInput,
  Universe, UniversePopulated, UniverseInput,
  Country
} from '../models';

// Generic entity hook state
export interface EntityHookState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  selectedItem: T | null;
}

// Generic entity hook actions
export interface EntityHookActions<T, U> {
  fetchAll: () => Promise<void>;
  fetchById: (id: string) => Promise<T | null>;
  create: (data: U) => Promise<T | null>;
  update: (id: string, data: Partial<U>) => Promise<T | null>;
  delete: (id: string) => Promise<boolean>;
  setSelectedItem: (item: T | null) => void;
  clearError: () => void;
}

// Combined entity hook return type
export interface EntityHook<T, U> extends EntityHookState<T>, EntityHookActions<T, U> {}

// Specific hook types for each entity
export interface UseMoviesHook extends EntityHook<Movie, MovieInput> {
  searchMovies: (query: string) => Promise<void>;
  getPopulatedMovie: (id: string) => Promise<MoviePopulated | null>;
}

export interface UseDirectorsHook extends EntityHook<Director, DirectorInput> {
  getPopulatedDirector: (id: string) => Promise<DirectorPopulated | null>;
}

export interface UseAwardsHook extends EntityHook<Award, AwardInput> {
  getPopulatedAward: (id: string) => Promise<AwardPopulated | null>;
}

export interface UseCategoriesHook extends EntityHook<Category, CategoryInput> {
  getPopulatedCategory: (id: string) => Promise<CategoryPopulated | null>;
}

export interface UseFranchisesHook extends EntityHook<Franchise, FranchiseInput> {
  getPopulatedFranchise: (id: string) => Promise<FranchisePopulated | null>;
}

export interface UseGenresHook extends EntityHook<Genre, GenreInput> {
  getPopulatedGenre: (id: string) => Promise<GenrePopulated | null>;
}

export interface UseLanguagesHook extends EntityHook<Language, LanguageInput> {
  getPopulatedLanguage: (id: string) => Promise<LanguagePopulated | null>;
}

export interface UseUniversesHook extends EntityHook<Universe, UniverseInput> {
  getPopulatedUniverse: (id: string) => Promise<UniversePopulated | null>;
}

export interface UseCountriesHook extends EntityHook<Country, { name: string }> {}

// Form hook types
export interface FormHookState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormHookActions<T> {
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFieldError: (field: keyof T, error: string) => void;
  clearErrors: () => void;
}

export interface FormHook<T> extends FormHookState<T>, FormHookActions<T> {}

// Pagination hook types
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface PaginationActions {
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setItemsPerPage: (count: number) => void;
}

export interface PaginationHook extends PaginationState, PaginationActions {
  canGoNext: boolean;
  canGoPrevious: boolean;
}

// Search hook types
export interface SearchState {
  query: string;
  results: any[];
  loading: boolean;
  error: string | null;
}

export interface SearchActions {
  setQuery: (query: string) => void;
  search: () => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export interface SearchHook extends SearchState, SearchActions {}