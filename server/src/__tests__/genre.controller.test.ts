import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/genre.js', () => ({
  Genre: {
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Genre } from '../schemaModels/genre.js';
import {
  getGenreList,
  getTopGenre,
  getGenreCount,
  addNewGenre
} from '../controllers/genre.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockGenreAggregate = vi.mocked(Genre.aggregate);
const mockGenreFindOneAndUpdate = vi.mocked(Genre.findOneAndUpdate);

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

// ─── getGenreList ──────────────────────────────────────────────────────────────

describe('getGenreList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getGenreList calls Genre.aggregate with the correct
   * $project and $sort pipeline and returns a 200 response with the results.
   */
  it('should return 200 with sorted genre list', async () => {
    const sampleGenres = [
      { _id: 'g1', name: 'Action' },
      { _id: 'g2', name: 'Drama' }
    ];
    mockGenreAggregate.mockResolvedValue(sampleGenres as any);
    const req = makeReq();
    const res = makeRes();

    await getGenreList(req, res);

    expect(mockGenreAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: { name: 1 } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleGenres);
  });

  /**
   * Verifies that getGenreList returns a 500 error response
   * when Genre.aggregate rejects with an error.
   */
  it('should return 500 when Genre.aggregate throws', async () => {
    mockGenreAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getGenreList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });

  /**
   * Verifies that getGenreList returns an empty array when
   * Genre.aggregate resolves with no results.
   */
  it('should return 200 with empty array when no genres exist', async () => {
    mockGenreAggregate.mockResolvedValue([] as any);
    const req = makeReq();
    const res = makeRes();

    await getGenreList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });
});

// ─── getTopGenre ─────────────────────────────────────────────────────────────

describe('getTopGenre', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopGenre calls Genre.aggregate with a $project,
   * $sort by length descending, and $limit:1 pipeline and returns 200.
   */
  it('should return 200 with the top genre from aggregate', async () => {
    const topGenre = [{ _id: 'g1', name: 'Action', length: 50 }];
    mockGenreAggregate.mockResolvedValue(topGenre as any);
    const req = makeReq();
    const res = makeRes();

    await getTopGenre(req, res);

    expect(mockGenreAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { length: -1 } }),
        expect.objectContaining({ $limit: 1 })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(topGenre);
  });

  /**
   * Verifies that getTopGenre returns a 500 error response
   * when Genre.aggregate rejects.
   */
  it('should return 500 when Genre.aggregate throws', async () => {
    mockGenreAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopGenre(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getGenreCount ─────────────────────────────────────────────────────────────

describe('getGenreCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getGenreCount calls Genre.aggregate with a $project
   * and $sort by name pipeline and returns 200 with count data.
   */
  it('should return 200 with genre count data sorted by name', async () => {
    const genreCountData = [
      { _id: 'g1', name: 'Action', length: 50 },
      { _id: 'g2', name: 'Drama', length: 30 }
    ];
    mockGenreAggregate.mockResolvedValue(genreCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getGenreCount(req, res);

    expect(mockGenreAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(genreCountData);
  });

  /**
   * Verifies that getGenreCount returns a 500 error response
   * when Genre.aggregate rejects.
   */
  it('should return 500 when Genre.aggregate throws', async () => {
    mockGenreAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getGenreCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewGenre ─────────────────────────────────────────────────────────────

describe('addNewGenre', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewGenre calls Genre.findOneAndUpdate with the correct
   * query and options, and returns a 200 response when a doc is found/created.
   */
  it('should return 200 with success message when doc is returned', async () => {
    const existingDoc = { _id: 'g1', name: 'Action' };
    mockGenreFindOneAndUpdate.mockResolvedValue(existingDoc as any);
    const req = makeReq({ body: { name: 'Action', movies: ['m1', 'm2'] } });
    const res = makeRes();

    await addNewGenre(req, res);

    expect(mockGenreFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Action', movies: ['m1', 'm2'] },
      { $set: { name: 'Action' } },
      { upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('New Genre Successfully added.');
  });

  /**
   * Verifies that addNewGenre does NOT send any response when doc is null/falsy
   * (this is the actual behavior — no else branch exists for the null case).
   */
  it('should not send a response when doc is null (no else branch)', async () => {
    mockGenreFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'Action', movies: [] } });
    const res = makeRes();

    await addNewGenre(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewGenre returns a 500 error response with the
   * error message string when Genre.findOneAndUpdate throws an Error instance.
   */
  it('should return 500 with error message when findOneAndUpdate throws an Error', async () => {
    mockGenreFindOneAndUpdate.mockRejectedValue(new Error('Duplicate key') as any);
    const req = makeReq({ body: { name: 'Action', movies: [] } });
    const res = makeRes();

    await addNewGenre(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Duplicate key' });
  });

  /**
   * Verifies that addNewGenre returns a 500 error response with
   * 'Unknown error occurred' when a non-Error value is thrown.
   */
  it('should return 500 with "Unknown error occurred" when a non-Error is thrown', async () => {
    mockGenreFindOneAndUpdate.mockRejectedValue('string error' as any);
    const req = makeReq({ body: { name: 'Action', movies: [] } });
    const res = makeRes();

    await addNewGenre(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});
