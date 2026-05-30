import { describe, it, expect, vi } from 'vitest';

// Mock the pages barrel so all named exports resolve to vi.fn() functions.
// routes.ts imports everything from '../components/pages' (the barrel index.ts),
// which re-exports default-exported components as named exports.
// Mocking individual files with named exports does NOT satisfy those imports;
// mocking the barrel directly ensures every route.component is a function.
vi.mock('../components/pages', () => ({
  Home: vi.fn(),
  Award: vi.fn(),
  Language: vi.fn(),
  Genre: vi.fn(),
  Director: vi.fn(),
  Year: vi.fn(),
  Franchise: vi.fn(),
  Universe: vi.fn(),
  Category: vi.fn(),
  TopRatedMovies: vi.fn(),
  AddNewCountry: vi.fn(),
  AddNewLanguage: vi.fn(),
  AddNewGenre: vi.fn(),
  AddNewUniverse: vi.fn(),
  AddNewFranchise: vi.fn(),
  AddNewAward: vi.fn(),
  AddNewCategory: vi.fn(),
  AddNewDirector: vi.fn(),
  AddNewMovie: vi.fn()
}));

// DirectorMovies is a default export imported directly (not via barrel)
vi.mock('../components/pages/DirectorMovies', () => ({ default: vi.fn() }));

import { routes } from '../components/routes/routes';
import type { routeProps } from '../components/routes/routes';

describe('routes configuration', () => {
  /**
   * Verifies that routes is exported as a non-empty array.
   */
  it('should export routes as a non-empty array', () => {
    expect(Array.isArray(routes)).toBe(true);
    expect(routes.length).toBeGreaterThan(0);
  });

  /**
   * Verifies that every route has the required properties: path, label, component, production.
   */
  it('should have path, label, component, and production on every route', () => {
    routes.forEach((route: routeProps) => {
      expect(typeof route.path).toBe('string');
      expect(route.path.startsWith('/')).toBe(true);
      expect(typeof route.label).toBe('string');
      expect(route.label.length).toBeGreaterThan(0);
      expect(typeof route.component).toBe('function');
      expect(typeof route.production).toBe('boolean');
    });
  });

  /**
   * Verifies that the /home route exists and is marked as a production route.
   */
  it('should include a /home production route', () => {
    const homeRoute = routes.find((r) => r.path === '/home');
    expect(homeRoute).toBeDefined();
    expect(homeRoute?.production).toBe(true);
    expect(homeRoute?.label).toBe('Home');
  });

  /**
   * Verifies that all expected production routes are present.
   */
  it('should include all expected production routes', () => {
    const productionPaths = routes.filter((r) => r.production).map((r) => r.path);

    expect(productionPaths).toContain('/home');
    expect(productionPaths).toContain('/language');
    expect(productionPaths).toContain('/director');
    expect(productionPaths).toContain('/directorMovies');
    expect(productionPaths).toContain('/genre');
    expect(productionPaths).toContain('/year');
    expect(productionPaths).toContain('/franchise');
    expect(productionPaths).toContain('/universe');
    expect(productionPaths).toContain('/category');
    expect(productionPaths).toContain('/award');
    expect(productionPaths).toContain('/top-rated-movies');
  });

  /**
   * Verifies that all expected non-production (dev-only) routes are present.
   */
  it('should include all expected non-production routes', () => {
    const devPaths = routes.filter((r) => !r.production).map((r) => r.path);

    expect(devPaths).toContain('/add-new-country');
    expect(devPaths).toContain('/add-new-language');
    expect(devPaths).toContain('/add-new-genre');
    expect(devPaths).toContain('/add-new-universe');
    expect(devPaths).toContain('/add-new-award');
    expect(devPaths).toContain('/add-new-director');
    expect(devPaths).toContain('/add-new-franchise');
    expect(devPaths).toContain('/add-new-category');
    expect(devPaths).toContain('/add-new-movie');
  });

  /**
   * Verifies that all route paths are unique (no duplicates).
   */
  it('should have unique paths across all routes', () => {
    const paths = routes.map((r) => r.path);
    const uniquePaths = new Set(paths);
    expect(uniquePaths.size).toBe(paths.length);
  });

  /**
   * Verifies that all route labels are unique.
   */
  it('should have unique labels across all routes', () => {
    const labels = routes.map((r) => r.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });

  /**
   * Verifies the total count of routes (11 production + 9 non-production = 20 total).
   */
  it('should have the correct total number of routes', () => {
    const productionCount = routes.filter((r) => r.production).length;
    const devCount = routes.filter((r) => !r.production).length;
    expect(productionCount).toBe(11);
    expect(devCount).toBe(9);
    expect(routes.length).toBe(20);
  });

  /**
   * Verifies that the /add-new-movie route has the correct label.
   */
  it('should have the correct label for /add-new-movie route', () => {
    const addMovieRoute = routes.find((r) => r.path === '/add-new-movie');
    expect(addMovieRoute).toBeDefined();
    expect(addMovieRoute?.label).toBe('Add New Movie');
    expect(addMovieRoute?.production).toBe(false);
  });
});
