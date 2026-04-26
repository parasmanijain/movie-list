// Export all type definitions
export * from './api-types';
export * from './hooks';

// Re-export model types for convenience
export * from '../models';

// Common utility types
export type ID = string;
export type Timestamp = string | Date;

// Generic types
export interface BaseEntity {
  _id: ID;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
}

export interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view' | 'delete';
  data?: any;
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Route types
export interface RouteParams {
  id?: string;
  [key: string]: string | undefined;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  spacing: number;
  borderRadius: number;
}

// Chart types for data visualization
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Filter types
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface NumberRange {
  min: number | null;
  max: number | null;
}

// Export constants
export const ENTITY_TYPES = {
  MOVIE: 'movie',
  DIRECTOR: 'director',
  AWARD: 'award',
  CATEGORY: 'category',
  FRANCHISE: 'franchise',
  GENRE: 'genre',
  LANGUAGE: 'language',
  UNIVERSE: 'universe',
  COUNTRY: 'country'
} as const;

export type EntityType = typeof ENTITY_TYPES[keyof typeof ENTITY_TYPES];