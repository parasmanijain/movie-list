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
  updateExistingMovie,
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
  chain['populate'] = populateFn;
  chain['lean'] = vi.fn(() => Promise.resolve(resolvedValue));
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
    mockMovieFind.mockImplementation(() => {
      throw new Error('DB error');
    });
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
    chain['populate'] = populateFn;
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
    mockMovieFindById.mockImplementation(() => {
      throw new Error('Not found');
    });
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
    const aggregateResult = [
      { _id: 'm1', name: 'Inception', year: 2010, imdb: 8.8, rottenTomatoes: 87 }
    ];
    mockMovieAggregate.mockResolvedValue(aggregateResult as any);
    const req = makeReq();
    const res = makeRes();

    await getTopMovie(req, res);

    expect(mockMovieAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          $project: expect.objectContaining({ name: 1, year: 1, imdb: 1 })
        })
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
    const result = [
      { _id: 2020, name: 2020, length: 10 },
      { _id: 2021, name: 2021, length: 15 }
    ];
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
      expect.arrayContaining([expect.objectContaining({ $match: { category: { $ne: null } } })])
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

// ─── updateExistingMovie ─────────────────────────────────────────────────────

const mockMovieFindByIdAndUpdate = vi.mocked(Movie.findByIdAndUpdate);

describe('updateExistingMovie', () => {
  beforeEach(() => vi.clearAllMocks());

  const existingMovieDoc = { _id: 'movie1', name: 'Updated Movie' };

  /**
   * Verifies that updateExistingMovie updates a movie and returns 200
   * when no language/director/genre/franchise changes are provided.
   */
  it('should update movie and return 200 with no relationship changes', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);

    const req = makeReq({
      body: { id: 'movie1', name: 'Updated Movie' }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockMovieFindByIdAndUpdate).toHaveBeenCalledWith('movie1', req.body, { new: true });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Records updated successfully' });
  });

  /**
   * Verifies that updateExistingMovie runs Language.bulkWrite for added/removed languages.
   */
  it('should run Language.bulkWrite when language changes are provided', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        language: { value: ['lang2'], added: ['lang2'], removed: ['lang1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockLanguageBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie runs Director.bulkWrite for added/removed directors.
   */
  it('should run Director.bulkWrite when director changes are provided', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        director: { value: ['dir2'], added: ['dir2'], removed: ['dir1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie runs Genre.bulkWrite for added/removed genres.
   */
  it('should run Genre.bulkWrite when genre changes are provided', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        genre: { value: ['genre2'], added: ['genre2'], removed: ['genre1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie runs Franchise.bulkWrite when franchise changes.
   */
  it('should run Franchise.bulkWrite when franchise changes are provided', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);
    mockFranchiseBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        franchise: { current: 'franchise1', new: 'franchise2' }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockFranchiseBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie returns 400 when Movie.findByIdAndUpdate throws.
   */
  it('should return 400 when Movie.findByIdAndUpdate throws', async () => {
    mockMovieFindByIdAndUpdate.mockRejectedValue(new Error('Update failed') as any);

    const req = makeReq({ body: { id: 'movie1', name: 'Bad Update' } });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
  });

  /**
   * Verifies that updateExistingMovie returns 400 when movie is not found (null result).
   */
  it('should return 400 when movie is not found (findByIdAndUpdate returns null)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(null as any);

    const req = makeReq({ body: { id: 'nonexistent', name: 'Ghost Movie' } });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  /**
   * Verifies that updateExistingMovie handles all relationship changes simultaneously.
   */
  it('should handle all relationship changes (language, director, genre, franchise) simultaneously', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);
    mockFranchiseBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        language: { value: ['lang2'], added: ['lang2'], removed: ['lang1'] },
        director: { value: ['dir2'], added: ['dir2'], removed: ['dir1'] },
        genre: { value: ['genre2'], added: ['genre2'], removed: ['genre1'] },
        franchise: { current: 'franchise1', new: 'franchise2' }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockLanguageBulkWrite).toHaveBeenCalledOnce();
    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(mockFranchiseBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles bulkWrite errors for language gracefully.
   */
  it('should handle Language.bulkWrite error gracefully', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc as any);
    mockLanguageBulkWrite.mockRejectedValue(new Error('BulkWrite failed') as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        language: { value: ['lang2'], added: ['lang2'], removed: ['lang1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    // Should still return 200 since bulkWrite errors are caught in .catch()
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── addNewMovie - additional coverage for then() callbacks ──────────────────────

describe('addNewMovie - bulkWrite then/catch callbacks', () => {
  beforeEach(() => vi.clearAllMocks());

  const baseMovieDocWithAll = {
    _id: 'newMovieId',
    director: ['dir1'],
    language: ['lang1'],
    genre: ['genre1'],
    franchise: 'franchise1',
    category: ['cat1', 'cat2']
  };

  /**
   * Verifies that addNewMovie handles Franchise.bulkWrite error in the catch callback.
   */
  it('should handle Franchise.bulkWrite error gracefully (catch callback)', async () => {
    mockMovieCreate.mockResolvedValue(baseMovieDocWithAll as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);
    mockFranchiseBulkWrite.mockRejectedValue(new Error('Franchise bulkWrite error') as any);
    mockCategoryBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        name: 'Test',
        language: ['lang1'],
        director: ['dir1'],
        imdb: 8.0,
        year: 2021,
        url: 'http://test.com',
        genre: ['genre1'],
        franchise: 'franchise1',
        category: ['cat1']
      }
    });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockFranchiseBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that addNewMovie handles Category.bulkWrite error in the catch callback.
   */
  it('should handle Category.bulkWrite error gracefully (catch callback)', async () => {
    mockMovieCreate.mockResolvedValue(baseMovieDocWithAll as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);
    mockFranchiseBulkWrite.mockResolvedValue({} as any);
    mockCategoryBulkWrite.mockRejectedValue(new Error('Category bulkWrite error') as any);

    const req = makeReq({
      body: {
        name: 'Test',
        language: ['lang1'],
        director: ['dir1'],
        imdb: 8.0,
        year: 2021,
        url: 'http://test.com',
        genre: ['genre1'],
        franchise: 'franchise1',
        category: ['cat1']
      }
    });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockCategoryBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that addNewMovie handles Director.bulkWrite error in the catch callback.
   */
  it('should handle Director.bulkWrite error gracefully (catch callback)', async () => {
    mockMovieCreate.mockResolvedValue({
      _id: 'newMovieId',
      director: ['dir1'],
      language: ['lang1'],
      genre: ['genre1'],
      franchise: null,
      category: null
    } as any);
    mockDirectorBulkWrite.mockRejectedValue(new Error('Director bulkWrite error') as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        name: 'Test',
        language: ['lang1'],
        director: ['dir1'],
        imdb: 8.0,
        year: 2021,
        url: 'http://test.com',
        genre: ['genre1']
      }
    });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that addNewMovie handles Language.bulkWrite error in the catch callback.
   */
  it('should handle Language.bulkWrite error gracefully (catch callback)', async () => {
    mockMovieCreate.mockResolvedValue({
      _id: 'newMovieId',
      director: ['dir1'],
      language: ['lang1'],
      genre: ['genre1'],
      franchise: null,
      category: null
    } as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockRejectedValue(new Error('Language bulkWrite error') as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        name: 'Test',
        language: ['lang1'],
        director: ['dir1'],
        imdb: 8.0,
        year: 2021,
        url: 'http://test.com',
        genre: ['genre1']
      }
    });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockLanguageBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that addNewMovie handles Genre.bulkWrite error in the catch callback (line 188).
   */
  it('should handle Genre.bulkWrite error gracefully (catch callback)', async () => {
    mockMovieCreate.mockResolvedValue({
      _id: 'newMovieId',
      director: ['dir1'],
      language: ['lang1'],
      genre: ['genre1'],
      franchise: null,
      category: null
    } as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);
    mockGenreBulkWrite.mockRejectedValue(new Error('Genre bulkWrite error') as any);

    const req = makeReq({
      body: {
        name: 'Test',
        language: ['lang1'],
        director: ['dir1'],
        imdb: 8.0,
        year: 2021,
        url: 'http://test.com',
        genre: ['genre1']
      }
    });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── updateExistingMovie - bulkWrite error callbacks ──────────────────────

describe('updateExistingMovie - bulkWrite error callbacks', () => {
  beforeEach(() => vi.clearAllMocks());

  const existingMovieDoc2 = { _id: 'movie1', name: 'Updated Movie' };

  /**
   * Verifies that updateExistingMovie handles Director.bulkWrite error gracefully (line 319).
   */
  it('should handle Director.bulkWrite error gracefully in updateExistingMovie', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc2 as any);
    mockDirectorBulkWrite.mockRejectedValue(new Error('Director bulkWrite error') as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        director: { value: ['dir2'], added: ['dir2'], removed: ['dir1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles Genre.bulkWrite error gracefully (line 355).
   */
  it('should handle Genre.bulkWrite error gracefully in updateExistingMovie', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc2 as any);
    mockGenreBulkWrite.mockRejectedValue(new Error('Genre bulkWrite error') as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        genre: { value: ['genre2'], added: ['genre2'], removed: ['genre1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles Franchise.bulkWrite error gracefully (line 388).
   */
  it('should handle Franchise.bulkWrite error gracefully in updateExistingMovie', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc2 as any);
    mockFranchiseBulkWrite.mockRejectedValue(new Error('Franchise bulkWrite error') as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        franchise: { current: 'franchise1', new: 'franchise2' }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockFranchiseBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─── getMovieList - non-Error exception branch ────────────────────────────────

describe('getMovieList - non-Error exception branch', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getMovieList handles a non-Error thrown value (string) and
   * returns 500 with 'Unknown error occurred'.
   */
  it('should return 500 with Unknown error when a non-Error is thrown', async () => {
    mockMovieFind.mockImplementation(() => {
      throw 'string error';
    });
    const req = makeReq({ query: {} as any });
    const res = makeRes();

    await getMovieList(req as any, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});

// ─── getMovieDetails - non-Error exception branch ─────────────────────────────

describe('getMovieDetails - non-Error exception branch', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getMovieDetails handles a non-Error thrown value and
   * returns 500 with 'Unknown error occurred'.
   */
  it('should return 500 with Unknown error when a non-Error is thrown', async () => {
    mockMovieFindById.mockImplementation(() => {
      throw { code: 'ENOTFOUND' };
    });
    const req = makeReq({ query: { movieID: 'bad-id' } as any });
    const res = makeRes();

    await getMovieDetails(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});

// ─── addNewMovie - non-Error exception branch ─────────────────────────────────

describe('addNewMovie - non-Error exception branch', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewMovie handles a non-Error thrown value and
   * returns 400 with 'Unknown error occurred'.
   */
  it('should return 400 with Unknown error when a non-Error is thrown', async () => {
    mockMovieCreate.mockRejectedValue('string rejection' as any);
    const req = makeReq({ body: { name: 'Test' } });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });

  /**
   * Verifies that addNewMovie handles the case where Movie.create returns null/falsy
   * (throws 'Failed to create movie') and returns 400.
   */
  it('should return 400 when Movie.create returns falsy (null)', async () => {
    mockMovieCreate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'Test', language: [], director: [], genre: [] } });
    const res = makeRes();

    await addNewMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create movie' });
  });
});

// ─── updateExistingMovie - non-Error exception branch ────────────────────────

describe('updateExistingMovie - non-Error exception branch', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that updateExistingMovie handles a non-Error thrown value and
   * returns 400 with 'Unknown error occurred'.
   */
  it('should return 400 with Unknown error when a non-Error is thrown', async () => {
    mockMovieFindByIdAndUpdate.mockRejectedValue('string rejection' as any);
    const req = makeReq({ body: { id: 'movie1', name: 'Test' } });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});

// ─── updateExistingMovie - language/director/genre with only added or only removed ──

describe('updateExistingMovie - partial added/removed arrays', () => {
  beforeEach(() => vi.clearAllMocks());

  const existingMovieDoc3 = { _id: 'movie1', name: 'Updated Movie' };

  /**
   * Verifies that updateExistingMovie handles language with only added (no removed).
   */
  it('should handle language with only added items (no removed)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc3 as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        language: { value: ['lang2'], added: ['lang2'], removed: [] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockLanguageBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles director with only removed (no added).
   */
  it('should handle director with only removed items (no added)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc3 as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        director: { value: [], added: [], removed: ['dir1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles genre with null added/removed (uses || []).
   */
  it('should handle genre with undefined added/removed (fallback to empty array)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc3 as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        genre: { value: ['genre1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles language where added is undefined
   * (triggers the optional chaining ?.map fallback to || [] at line 259).
   */
  it('should handle language where added is undefined (optional chain fallback)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc3 as any);
    mockLanguageBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        // added is undefined - triggers language.added?.map fallback to || []
        language: { value: ['lang2'], removed: ['lang1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockLanguageBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles director where removed is undefined
   * (triggers the optional chaining ?.map fallback to || [] at line 295).
   */
  it('should handle director where removed is undefined (optional chain fallback)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc3 as any);
    mockDirectorBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        // removed is undefined - triggers director.removed?.map fallback to || []
        director: { value: ['dir2'], added: ['dir2'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockDirectorBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  /**
   * Verifies that updateExistingMovie handles genre where added is undefined
   * (triggers the optional chaining ?.map fallback to || []).
   */
  it('should handle genre where added is undefined (optional chain fallback)', async () => {
    mockMovieFindByIdAndUpdate.mockResolvedValue(existingMovieDoc3 as any);
    mockGenreBulkWrite.mockResolvedValue({} as any);

    const req = makeReq({
      body: {
        id: 'movie1',
        // added is undefined - triggers genre.added?.map fallback to || []
        genre: { value: ['genre2'], removed: ['genre1'] }
      }
    });
    const res = makeRes();

    await updateExistingMovie(req, res);

    expect(mockGenreBulkWrite).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
