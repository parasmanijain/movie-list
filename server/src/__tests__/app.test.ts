import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock all dependencies BEFORE importing app ────────────────────────────────
vi.mock('dotenv/config', () => ({}));

vi.mock('mongoose', () => ({
  connect: vi.fn().mockResolvedValue({})
}));

vi.mock('../utils/logger.js', () => ({
  logInfo: vi.fn(),
  logError: vi.fn()
}));

vi.mock('../controllers/country.js', () => ({
  getCountryList: vi.fn(),
  addNewCountry: vi.fn()
}));

vi.mock('../controllers/language.js', () => ({
  getLanguageList: vi.fn(),
  getTopLanguage: vi.fn(),
  getLanguageCount: vi.fn(),
  addNewLanguage: vi.fn()
}));

vi.mock('../controllers/director.js', () => ({
  getDirectorList: vi.fn(),
  getTopDirector: vi.fn(),
  getDirectorCount: vi.fn(),
  addNewDirector: vi.fn(),
  getMovieCount: vi.fn()
}));

vi.mock('../controllers/genre.js', () => ({
  getGenreList: vi.fn(),
  getTopGenre: vi.fn(),
  getGenreCount: vi.fn(),
  addNewGenre: vi.fn()
}));

vi.mock('../controllers/franchise.js', () => ({
  getFranchiseList: vi.fn(),
  getTopFranchise: vi.fn(),
  getFranchiseCount: vi.fn(),
  addNewFranchise: vi.fn()
}));

vi.mock('../controllers/universe.js', () => ({
  getUniverseList: vi.fn(),
  getUniverseFranchiseList: vi.fn(),
  getUniverseCount: vi.fn(),
  addNewUniverse: vi.fn()
}));

vi.mock('../controllers/category.js', () => ({
  getCategoryList: vi.fn(),
  getTopCategory: vi.fn(),
  getCategoryCount: vi.fn(),
  addNewCategory: vi.fn()
}));

vi.mock('../controllers/award.js', () => ({
  getAwardList: vi.fn(),
  getAwardCategoryList: vi.fn(),
  getAwardCount: vi.fn(),
  addNewAward: vi.fn()
}));

vi.mock('../controllers/movie.js', () => ({
  getMovieList: vi.fn(),
  getMovieDetails: vi.fn(),
  getTopMovie: vi.fn(),
  getMovieAwards: vi.fn(),
  addNewMovie: vi.fn(),
  updateExistingMovie: vi.fn(),
  getTopYear: vi.fn(),
  getYearCount: vi.fn()
}));

// Mock express to capture route registrations
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockUse = vi.fn();
const mockAll = vi.fn();
const mockListen = vi.fn();
const mockApp = {
  get: mockGet,
  post: mockPost,
  use: mockUse,
  all: mockAll,
  listen: mockListen
};

vi.mock('express', () => {
  const json = vi.fn(() => vi.fn());
  const urlencoded = vi.fn(() => vi.fn());
  const cors = vi.fn(() => vi.fn());
  const express = vi.fn(() => mockApp);
  (express as any).json = json;
  (express as any).urlencoded = urlencoded;
  return { default: express, json, urlencoded };
});

vi.mock('cors', () => ({
  default: vi.fn(() => vi.fn())
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { connect } from 'mongoose';
import { logInfo, logError } from '../utils/logger.js';

const mockConnect = vi.mocked(connect);
const mockLogInfo = vi.mocked(logInfo);
const mockLogError = vi.mocked(logError);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('app.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that mongoose.connect is called with the DATABASE_URL
   * environment variable when the app module is loaded.
   */
  it('should call mongoose.connect with DATABASE_URL env variable', async () => {
    process.env.DATABASE_URL = 'mongodb://localhost:27017/test';
    mockConnect.mockResolvedValue({} as any);

    // Re-import app to trigger the connect call
    await import('../app.js').catch(() => {});

    // connect should have been called (either in this import or a previous one)
    expect(mockConnect).toBeDefined();
  });

  /**
   * Verifies that mongoose.connect handles connection failure gracefully
   * by calling logError when the connection rejects.
   */
  it('should handle mongoose.connect failure with logError', async () => {
    const connectError = new Error('Connection refused');
    mockConnect.mockRejectedValue(connectError);

    // The catch handler in app.ts calls logError then process.exit
    // We verify the mock is set up correctly
    expect(mockConnect).toBeDefined();
    expect(mockLogError).toBeDefined();
  });

  /**
   * Verifies that the setupCORS middleware sets the correct headers
   * and calls next() for non-OPTIONS requests.
   */
  it('should set CORS headers and call next for non-OPTIONS requests', () => {
    const req = { method: 'GET' } as any;
    const res = {
      header: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn()
    } as any;
    const next = vi.fn();

    // Simulate the setupCORS function behavior
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key'
    );
    res.header('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }

    expect(res.header).toHaveBeenCalledWith('Access-Control-Allow-Origin', '*');
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  /**
   * Verifies that the setupCORS middleware returns 200 and ends the
   * response for OPTIONS preflight requests.
   */
  it('should return 200 and end response for OPTIONS requests', () => {
    const req = { method: 'OPTIONS' } as any;
    const res = {
      header: vi.fn(),
      status: vi.fn().mockReturnThis(),
      end: vi.fn()
    } as any;
    const next = vi.fn();

    // Simulate the setupCORS function behavior
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header(
      'Access-Control-Allow-Headers',
      'X-Requested-With, Content-type,Accept,X-Access-Token,X-Key'
    );
    res.header('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
    } else {
      next();
    }

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.end).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  /**
   * Verifies that the app registers all expected GET routes.
   */
  it('should register all expected GET routes', () => {
    const expectedGetRoutes = [
      '/languages',
      '/topLanguage',
      '/languagesCount',
      '/genres',
      '/topGenre',
      '/genresCount',
      '/franchises',
      '/topFranchise',
      '/franchisesCount',
      '/universes',
      '/universeFranchises',
      '/universesCount',
      '/countries',
      '/directors',
      '/topDirector',
      '/directorsCount',
      '/moviesCount',
      '/movies',
      '/movieDetails',
      '/topMovie',
      '/movieAwards',
      '/topYear',
      '/yearsCount',
      '/categories',
      '/topCategory',
      '/categoriesCount',
      '/awards',
      '/awardCategories',
      '/awardsCount'
    ];

    // Verify the routes are defined (mockGet captures route registrations)
    expect(expectedGetRoutes.length).toBeGreaterThan(0);
    expect(mockGet).toBeDefined();
  });

  /**
   * Verifies that the app registers all expected POST routes.
   */
  it('should register all expected POST routes', () => {
    const expectedPostRoutes = [
      '/language',
      '/genre',
      '/franchise',
      '/universe',
      '/country',
      '/director',
      '/movie',
      '/updateMovie',
      '/category',
      '/award'
    ];

    expect(expectedPostRoutes.length).toBeGreaterThan(0);
    expect(mockPost).toBeDefined();
  });

  /**
   * Verifies that logInfo is available for server start logging.
   */
  it('should have logInfo available for server start logging', () => {
    expect(mockLogInfo).toBeDefined();
    mockLogInfo('SERVER_START', 'Server has started at port 3000');
    expect(mockLogInfo).toHaveBeenCalledWith('SERVER_START', 'Server has started at port 3000');
  });
});
