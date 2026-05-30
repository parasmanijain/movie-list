import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
// NOTE: vi.mock factories are hoisted — all vi.fn() calls must be inline
// (no references to outer const variables allowed inside the factory).

vi.mock('../schemaModels/movie.js', () => ({
  Movie: {
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    findByIdAndUpdate: vi.fn()
  }
}));

vi.mock('../schemaModels/director.js', () => ({
  Director: { bulkWrite: vi.fn() }
}));

vi.mock('../schemaModels/language.js', () => ({
  Language: { bulkWrite: vi.fn() }
}));

vi.mock('../schemaModels/genre.js', () => ({
  Genre: { bulkWrite: vi.fn() }
}));

vi.mock('../schemaModels/franchise.js', () => ({
  Franchise: { bulkWrite: vi.fn() }
}));

vi.mock('../schemaModels/category.js', () => ({
  Category: { bulkWrite: vi.fn() }
}));

vi.mock('../utils/logger.js', () => ({
  logInfo: vi.fn(),
  logError: vi.fn()
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────────────
import { Movie } from '../schemaModels/movie.js';
import { Director } from '../schemaModels/director.js';
import { Language } from '../schemaModels/language.js';
import { Genre } from '../schemaModels/genre.js';
import { Franchise } from '../schemaModels/franchise.js';
import { Category } from '../schemaModels/category.js';

import {
  getMovieList,
  getMovieDetails,
  getTopMovie,
  addNewMovie,
  getTopYear,
  getYearCount,
  getMovieAwards
} from '../controllers/movie.js';

// ─── Typed mock accessors ───────────────────────────────────────────────────────────────────
const mockMovieFind = vi.mocked(Movie.find);
const mockMovieCountDocuments = vi.mocked(Movie.countDocuments);
const mockMovieFindById = vi.mocked(Movie.findById);
const mockMovieAggregate = vi.mocked(Movie.aggregate);
const mockMovieCreate = vi.mocked(Movie.create);
const mockDirectorBulkWrite = vi.mocked(Director.bulkWrite);
const mockLanguageBulkWrite = vi.mocked(Language.bulkWrite);
const mockGenreBulkWrite = vi.mocked(Genre.bulkWrite);
const mockFranchiseBulkWrite = vi.mocked(Franchise.bulkWrite);
const mockCategoryBulkWrite = vi.mocked(Category.bulkWrite);

// ─── Helpers ────────────────────────────────────────────────────────────────────────

const makeRes = (): Response => {
  const res = {
    json: vi.fn(),
    send: vi.fn(),
    status: vi.fn()
  } as unknown as Response;
  (res.status as ReturnType<typeof vi.fn>).mockReturnValue(res);
  return res;
};

const makeReq = (overrides: Partial<Request> = {}): Request =>
  ({ query: {}, body: {}, params: {}, ...overrides }) as unknown as Request;

/** Builds a chainable populate/lean chain that resolves to `resolvedValue`. */
const makePopulateChain = (resolvedValue: unknown) => {
  const chain: Record<string, unknown> = {};
  const populateFn = vi.fn(() => chain);
  chain.populate = populateFn;
  chain.lean = vi.fn(() => Promise.resolve(resolvedValue));
  return chain;
};

// ─── Sample data ───────────────────────────────────────────────────────────────────

const sampleMovies = [
  { _id: 'movie1', name: 'Inception', year: 2010, imdb: 8.8, rottenTomatoes: 87 },
  { _id: 'movie2', name: 'Interstellar', year: 2014, imdb: 8.6, rottenTomatoes: 72 }
];

// ─── getMovieList ───────────────────────────────────────────────────────────────────

describe('getMovieList', () => {
  beforeEach(() => vi.clearAllMocks());

  const setupMovieFind = (movies: unknown[]) => {
    const chain = makePopulateChain(movies);
    mockMovieFind.mockReturnValue(chain as any);
    mockMovieCountDocuments.mockResolvedValue(movies.length as any);
  };

  /**
   * Verifies that getMovieList returns the correct response shape
   * {total, page, pageSize, movies} with default pagination (page=1, limit=36).
   */
  it('should return correct response shape with default pagination', async () => {
    setupMovieFind(sampleMovies);
    const req = makeReq({ query: {} as any });
    const res = makeRes();

    await getMovieList(req as any, res);

    expect(res.json).toHaveBeenCalledWith({
      total: 2,
      page: 1,
      pageSize: 2,
      movies: sampleMovies
    });
  });

  /**
   * Verifies that pagination query params (page, limit) are respected
   * and passed correctly to the Movie.find call (skip = (page-1)*limit).
   */
  it('should respect page and limit query params', async () => {
    setupMovieFind(sampleMovies);
    const req = makeReq({ query: { page: '2', limit: '10' } as any });
    const res = makeRes();

    await getMovieList(req as any, res);

    expect(mockMovieFind).toHaveBeenCalledWith(
      {},
      expect.any(String),
      expect.objectContaining({ skip: 10, limit: 10 })
    );
  });

  /**
   * Verifies that page is clamped to minimum 1 when an invalid (negative)
   * value is provided, resulting in skip=0.
   */
  it('should clamp page to minimum 1 when invalid page is provided', async () => {
    setupMovieFind([]);
    const req = makeReq({ query: { page: '-5', limit: '10' } as any });
    const res = makeRes();

    await getMovieList(req as any, res);

    expect(mockMovieFind).toHaveBeenCalledWith(
      {},
      expect.any(String),
      expect.objectContaining({ skip: 0 })
    );
  });

  /**
   * Verifies that limit is clamped to maximum 100 when an excessive
   * value (e.g. 9999) is provided.
   */
  it('should clamp limit to maximum 100', async () => {
    setupMovieFind([]);
    const req = makeReq({ query: { page: '1', limit: '9999' } as any });
    const res = makeRes();

    await getMovieList(req as any, res);

    expect(mockMovieFind).toHaveBeenCalledWith(
      {},
      expect.any(String),
      expect.objectContaining({ limit: 100 })
    );
  });

  /**
   * Verifies that a 500 error response is returned when Movie.find throws.
   */
  it('should return 500 on database error', async () => {
    mockMovieFind.mockImplementation(() => { throw new Error('DB error'); });
    const req = makeReq({ query: {} as any });
    const res = makeRes();

    await getMovieList(req as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'DB error' });
  });
});

// ─── getMovieDetails ───────────────────────────────────────────────────────────────

describe('getMovieDetails', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Builds a chainable populate chain where the 5th populate call
   * returns a resolved promise with `result`.
   */
  const setupFindById = (result: unknown) => {
    const chain: Record<string, unknown> = {};
    let callCount = 0;
    const populateFn = vi.fn(() => {
      callCount++;
      if (callCount >= 5) return Promise.resolve(result);
      return chain;
    });
    chain.populate = populateFn;
    mockMovieFindById.mockReturnValue(chain as any);
  };

  /**
   * Verifies that getMovieDetails calls Movie.findById with the movieID
   * query param and returns a 200 response with the movie data.
   */
  it('should return 200 with movie details for a valid movieID', async () => {
    const movieDetail = { _id: 'movie1', name: 'Inception' };
    setupFindById(movieDetail);
    const req = makeReq({ query: { movieID: 'movie1' } as any });
    const res = makeRes();

    await getMovieDetails(req, res);

    expect(mockMovieFindById).toHaveBeenCalledWith('movie1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(movieDetail);
  });

  /**
   * Verifies that getMovieDetails returns a 500 error response
   * when Movie.findById throws an exception.
   */
  it('should return 500 when Movie.findById throws', async () => {
    mockMovieFindById.mockImplementation(() => { throw new Error('Not found'); });
    const req = makeReq({ query: { movieID: 'bad-id' } as any });
    const res = makeRes();

    await getMovieDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Not found' });
  });
});

// ─── getTopMovie ─────────────────────────────────────────────────────────────────────

describe('getTopMovie', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopMovie calls Movie.aggregate with the correct
   * $project pipeline and returns a 200 response with the results.
   */
  it('should return 200 with aggregated top movies', async () => {
    const aggregateResult = [{ _id: 'm1', name: 'Inception', year: 2010, imdb: 8.8, rottenTomatoes: 87 }];
    mockMovieAggregate.mockResolvedValue(aggregateResult as any);
    const req = makeReq();
    const res = makeRes();

    await getTopMovie(req, res);

    expect(mockMovieAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: expect.objectContaining({ name: 1, year: 1, imdb: 1 }) })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(aggregateResult);
  });

  /**
   * Verifies that getTopMovie returns a 500 error response
   * when Movie.aggregate rejects.
   */
  it('should return 500 when aggregate throws', async () => {
    mockMovieAggregate.mockRejectedValue(new Error('Aggregate failed') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── addNewMovie ─────────────────────────────────────────────────────────────────────

describe('addNewMovie', () => {
  beforeEach(() => vi.clearAllMocks());

  const baseMovieDoc = {
    _id: 'newMovieId',
    director: ['dir1'],
    language: ['lang1'],
    genre: ['genre1'],
    franchise: null,
    category: null
  };

  const baseBody = {
    name: 'Dune',
    language: ['lang1'],
    director: ['dir1'],
    imdb: 8.0,
    rottenTomatoes: 83,
    year: 2021,
    url: 'https://imdb.com/dune',
    genre: ['genre1']
  };

  /**
   * Verifies that addNewMovie creates a movie and runs bulkWrite for
   * director, language, and genre models, then returns 200 with success message.
   */
  it('should create movie and run bulkWrite for director/language/genre, return 200', async () => {
    mockMovieCreate.mockResolvedValue(baseMovieDoc as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({ body: baseBody });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockMovieCreate).toHaveBeenCalledOnce();
    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(mockLanguageBulkWrite).toHaveBeenCalledOnce();
    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Records updated successfully' });
  });

  /**
   * Verifies that addNewMovie also runs Franchise.bulkWrite when
   * the created movie has a franchise field set.
   */
  it('should run Franchise.bulkWrite when movie has a franchise', async () => {
    mockMovieCreate.mockResolvedValue({ ...baseMovieDoc, franchise: 'franchise1' } as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);
    mockFranchiseBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({ body: { ...baseBody, franchise: 'franchise1' } });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockFranchiseBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that addNewMovie also runs Category.bulkWrite when
   * the created movie has a non-empty category array.
   */
  it('should run Category.bulkWrite when movie has categories', async () => {
    mockMovieCreate.mockResolvedValue({ ...baseMovieDoc, category: ['cat1', 'cat2'] } as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);
    mockCategoryBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({ body: { ...baseBody, category: ['cat1', 'cat2'] } });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockCategoryBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that addNewMovie returns a 400 error response when
   * Movie.create rejects with an error.
   */
  it('should return 400 when Movie.create throws', async () => {
    mockMovieCreate.mockRejectedValue(new Error('Validation error') as any);
    const req = makeReq({ body: { name: 'Bad Movie' } });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation error' });
  });
});

// ─── getTopYear ──────────────────────────────────────────────────────────────────────

describe('getTopYear', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopYear calls Movie.aggregate with a $group/$sort/$limit
   * pipeline and returns a 200 response with the top year result.
   */
  it('should return 200 with the top year from aggregate', async () => {
    const result = [{ _id: 2021, count: 15 }];
    mockMovieAggregate.mockResolvedValue(result as any);
    const req = makeReq();
    const res = makeRes();

    await getTopYear(req, res);

    expect(mockMovieAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $group: expect.objectContaining({ _id: '$year' }) })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(result);
  });

  /**
   * Verifies that getTopYear returns a 500 error response when aggregate rejects.
   */
  it('should return 500 when aggregate throws', async () => {
    mockMovieAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopYear(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getYearCount ────────────────────────────────────────────────────────────────────

describe('getYearCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getYearCount returns 200 with year-grouped counts
   * from the aggregate pipeline.
   */
  it('should return 200 with year counts from aggregate', async () => {
    const result = [{ _id: 2020, name: 2020, length: 10 }, { _id: 2021, name: 2021, length: 15 }];
    mockMovieAggregate.mockResolvedValue(result as any);
    const req = makeReq();
    const res = makeRes();

    await getYearCount(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(result);
  });

  /**
   * Verifies that getYearCount returns 500 when aggregate rejects.
   */
  it('should return 500 when aggregate throws', async () => {
    mockMovieAggregate.mockRejectedValue(new Error('Error') as any);
    const req = makeReq();
    const res = makeRes();

    await getYearCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─── getMovieAwards ──────────────────────────────────────────────────────────────────

describe('getMovieAwards', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getMovieAwards calls Movie.aggregate with a $match pipeline
   * filtering movies with non-null categories, and returns 200 with results.
   */
  it('should return 200 with movies that have awards', async () => {
    const result = [{ _id: 'm1', name: 'Parasite', year: 2019, length: 4 }];
    mockMovieAggregate.mockResolvedValue(result as any);
    const req = makeReq();
    const res = makeRes();

    await getMovieAwards(req, res);

    expect(mockMovieAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $match: { category: { $ne: null } } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(result);
  });

  /**
   * Verifies that getMovieAwards returns 500 when aggregate rejects.
   */
  it('should return 500 when aggregate throws', async () => {
    mockMovieAggregate.mockRejectedValue(new Error('Error') as any);
    const req = makeReq();
    const res = makeRes();

    await getMovieAwards(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
  });
});
