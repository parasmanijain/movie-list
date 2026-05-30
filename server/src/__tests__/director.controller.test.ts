import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/director.js', () => ({
  Director: {
    aggregate: vi.fn(),
    create: vi.fn()
  }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Director } from '../schemaModels/director.js';
import {
  getDirectorList,
  getTopDirector,
  getDirectorCount,
  getMovieCount,
  addNewDirector
} from '../controllers/director.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockDirectorAggregate = vi.mocked(Director.aggregate);
const mockDirectorCreate = vi.mocked(Director.create);

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── getDirectorList ───────────────────────────────────────────────────────────

describe('getDirectorList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getDirectorList calls Director.aggregate with the correct
   * $project and $sort pipeline and returns a 200 response with the results.
   */
  it('should return 200 with sorted director list', async () => {
    const sampleDirectors = [
      { _id: 'd1', name: 'Christopher Nolan' },
      { _id: 'd2', name: 'Steven Spielberg' }
    ];
    mockDirectorAggregate.mockResolvedValue(sampleDirectors as any);
    const req = makeReq();
    const res = makeRes();

    await getDirectorList(req, res);

    expect(mockDirectorAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: { name: 1 } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleDirectors);
  });

  /**
   * Verifies that getDirectorList returns a 500 error response
   * when Director.aggregate rejects with an error.
   */
  it('should return 500 when Director.aggregate throws', async () => {
    mockDirectorAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getDirectorList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getTopDirector ───────────────────────────────────────────────────────────

describe('getTopDirector', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopDirector calls Director.aggregate with a $project,
   * $sort by length descending, and $limit:1 pipeline and returns 200 with the top director.
   */
  it('should return 200 with the top director from aggregate', async () => {
    const topDirector = [{ _id: 'd1', name: 'Christopher Nolan', length: 12 }];
    mockDirectorAggregate.mockResolvedValue(topDirector as any);
    const req = makeReq();
    const res = makeRes();

    await getTopDirector(req, res);

    expect(mockDirectorAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { length: -1 } }),
        expect.objectContaining({ $limit: 1 })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(topDirector);
  });

  /**
   * Verifies that getTopDirector returns a 500 error response
   * when Director.aggregate rejects.
   */
  it('should return 500 when Director.aggregate throws', async () => {
    mockDirectorAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopDirector(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getDirectorCount ──────────────────────────────────────────────────────────

describe('getDirectorCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getDirectorCount calls Director.aggregate with a $project
   * and $sort by name pipeline and returns 200 with count data.
   */
  it('should return 200 with director count data sorted by name', async () => {
    const directorCountData = [
      { _id: 'd1', name: 'Christopher Nolan', length: 12 },
      { _id: 'd2', name: 'Steven Spielberg', length: 20 }
    ];
    mockDirectorAggregate.mockResolvedValue(directorCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getDirectorCount(req, res);

    expect(mockDirectorAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(directorCountData);
  });

  /**
   * Verifies that getDirectorCount returns a 500 error response
   * when Director.aggregate rejects.
   */
  it('should return 500 when Director.aggregate throws', async () => {
    mockDirectorAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getDirectorCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getMovieCount ─────────────────────────────────────────────────────────────

describe('getMovieCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getMovieCount calls Director.aggregate with a $group pipeline
   * grouping by total movies per director and returns 200 with the results.
   */
  it('should return 200 with movie count distribution data', async () => {
    const movieCountData = [
      { _id: 1, movie_count: 1, director_count: 50 },
      { _id: 2, movie_count: 2, director_count: 30 }
    ];
    mockDirectorAggregate.mockResolvedValue(movieCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getMovieCount(req, res);

    expect(mockDirectorAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $group: expect.objectContaining({ _id: '$total' }) })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(movieCountData);
  });

  /**
   * Verifies that getMovieCount returns a 500 error response
   * when Director.aggregate rejects.
   */
  it('should return 500 when Director.aggregate throws', async () => {
    mockDirectorAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getMovieCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewDirector ───────────────────────────────────────────────────────────

describe('addNewDirector', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewDirector calls Director.create with the request body
   * and returns a 200 JSON response with the created director document.
   */
  it('should return 200 with the created director document', async () => {
    const newDirector = {
      _id: 'd1',
      name: 'Christopher Nolan',
      url: 'https://imdb.com/nolan',
      country: ['UK']
    };
    mockDirectorCreate.mockResolvedValue(newDirector as any);
    const req = makeReq({
      body: { name: 'Christopher Nolan', url: 'https://imdb.com/nolan', country: ['UK'] }
    });
    const res = makeRes();

    await addNewDirector(req, res);

    expect(mockDirectorCreate).toHaveBeenCalledWith({
      name: 'Christopher Nolan',
      url: 'https://imdb.com/nolan',
      country: ['UK']
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(newDirector);
  });

  /**
   * Verifies that addNewDirector returns a 500 error response
   * when Director.create rejects with an error.
   */
  it('should return 500 when Director.create throws', async () => {
    mockDirectorCreate.mockRejectedValue(new Error('Validation error') as any);
    const req = makeReq({ body: { name: 'Bad Director' } });
    const res = makeRes();

    await addNewDirector(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});
