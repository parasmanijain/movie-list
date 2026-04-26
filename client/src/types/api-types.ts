// API endpoint types for all entities
import type {
  Movie, MoviePopulated, MovieInput,
  Director, DirectorPopulated, DirectorInput,
  Award, AwardPopulated, AwardInput,
  Category, CategoryPopulated, CategoryInput,
  Franchise, FranchisePopulated, FranchiseInput,
  Genre, GenrePopulated, GenreInput,
  Language, LanguagePopulated, LanguageInput,
  Universe, UniversePopulated, UniverseInput,
  Country,
  ApiResponse,
  PaginatedResponse
} from '../models';

// Movie API types
export interface MovieApiEndpoints {
  getAll: () => Promise<ApiResponse<Movie[]>>;
  getById: (id: string) => Promise<ApiResponse<MoviePopulated>>;
  create: (data: MovieInput) => Promise<ApiResponse<Movie>>;
  update: (id: string, data: Partial<MovieInput>) => Promise<ApiResponse<Movie>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
  search: (query: string) => Promise<ApiResponse<Movie[]>>;
}

// Director API types
export interface DirectorApiEndpoints {
  getAll: () => Promise<ApiResponse<Director[]>>;
  getById: (id: string) => Promise<ApiResponse<DirectorPopulated>>;
  create: (data: DirectorInput) => Promise<ApiResponse<Director>>;
  update: (id: string, data: Partial<DirectorInput>) => Promise<ApiResponse<Director>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Award API types
export interface AwardApiEndpoints {
  getAll: () => Promise<ApiResponse<Award[]>>;
  getById: (id: string) => Promise<ApiResponse<AwardPopulated>>;
  create: (data: AwardInput) => Promise<ApiResponse<Award>>;
  update: (id: string, data: Partial<AwardInput>) => Promise<ApiResponse<Award>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Category API types
export interface CategoryApiEndpoints {
  getAll: () => Promise<ApiResponse<Category[]>>;
  getById: (id: string) => Promise<ApiResponse<CategoryPopulated>>;
  create: (data: CategoryInput) => Promise<ApiResponse<Category>>;
  update: (id: string, data: Partial<CategoryInput>) => Promise<ApiResponse<Category>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Franchise API types
export interface FranchiseApiEndpoints {
  getAll: () => Promise<ApiResponse<Franchise[]>>;
  getById: (id: string) => Promise<ApiResponse<FranchisePopulated>>;
  create: (data: FranchiseInput) => Promise<ApiResponse<Franchise>>;
  update: (id: string, data: Partial<FranchiseInput>) => Promise<ApiResponse<Franchise>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Genre API types
export interface GenreApiEndpoints {
  getAll: () => Promise<ApiResponse<Genre[]>>;
  getById: (id: string) => Promise<ApiResponse<GenrePopulated>>;
  create: (data: GenreInput) => Promise<ApiResponse<Genre>>;
  update: (id: string, data: Partial<GenreInput>) => Promise<ApiResponse<Genre>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Language API types
export interface LanguageApiEndpoints {
  getAll: () => Promise<ApiResponse<Language[]>>;
  getById: (id: string) => Promise<ApiResponse<LanguagePopulated>>;
  create: (data: LanguageInput) => Promise<ApiResponse<Language>>;
  update: (id: string, data: Partial<LanguageInput>) => Promise<ApiResponse<Language>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Universe API types
export interface UniverseApiEndpoints {
  getAll: () => Promise<ApiResponse<Universe[]>>;
  getById: (id: string) => Promise<ApiResponse<UniversePopulated>>;
  create: (data: UniverseInput) => Promise<ApiResponse<Universe>>;
  update: (id: string, data: Partial<UniverseInput>) => Promise<ApiResponse<Universe>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Country API types
export interface CountryApiEndpoints {
  getAll: () => Promise<ApiResponse<Country[]>>;
  getById: (id: string) => Promise<ApiResponse<Country>>;
  create: (data: { name: string }) => Promise<ApiResponse<Country>>;
  update: (id: string, data: { name: string }) => Promise<ApiResponse<Country>>;
  delete: (id: string) => Promise<ApiResponse<void>>;
}

// Combined API client interface
export interface ApiClient {
  movies: MovieApiEndpoints;
  directors: DirectorApiEndpoints;
  awards: AwardApiEndpoints;
  categories: CategoryApiEndpoints;
  franchises: FranchiseApiEndpoints;
  genres: GenreApiEndpoints;
  languages: LanguageApiEndpoints;
  universes: UniverseApiEndpoints;
  countries: CountryApiEndpoints;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Component prop types
export interface EntityListProps<T> {
  items: T[];
  loading?: boolean;
  error?: string;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onView?: (item: T) => void;
}

export interface EntityFormProps<T, U> {
  initialData?: T;
  onSubmit: (data: U) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}