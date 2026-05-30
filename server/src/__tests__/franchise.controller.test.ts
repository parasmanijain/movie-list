import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/franchise.js', () => ({
  Franchise: {
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

vi.mock('../schemaModels/universe.js', () => ({
  Universe: {
    bulkWrite: vi.fn()
  }
}));

vi.mock('../utils/logger.js', () => ({
  logInfo: vi.fn(),
  logError: vi.fn()
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Franchise } from '../schemaModels/franchise.js';
import { Universe } from '../schemaModels/universe.js';
import { logInfo, logError } from '../utils/logger.js';
import {
  getFranchiseList,
  getTopFranchise,
  getFranchiseCount,
  addNewFranchise
} from '../controllers/franchise.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockFranchiseAggregate = vi.mocked(Franchise.aggregate);
const mockFranchiseFindOneAndUpdate = vi.mocked(Franchise.findOneAndUpdate);
const mockUniverseBulkWrite = vi.mocked(Universe.bulkWrite);
const mockLogInfo = vi.mocked(logInfo);
const mockLogError = vi.mocked(logError);

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

// ─── getFranchiseList ──────────────────────────────────────────────────────────

describe('getFranchiseList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getFranchiseList calls Franchise.aggregate with a $match
   * (universe: $exists: false), $project, and $sort pipeline and returns 200.
   */
  it('should return 200 with franchises that have no universe', async () => {
    const sampleFranchises = [
      { _id: 'f1', name: 'The Dark Knight' },
      { _id: 'f2', name: 'Inception' }
    ];
    mockFranchiseAggregate.mockResolvedValue(sampleFranchises as any);
    const req = makeReq();
    const res = makeRes();

    await getFranchiseList(req, res);

    expect(mockFranchiseAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $match: { universe: { $exists: false } } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleFranchises);
  });

  /**
   * Verifies that getFranchiseList returns a 500 error response
   * when Franchise.aggregate rejects with an error.
   */
  it('should return 500 when Franchise.aggregate throws', async () => {
    mockFranchiseAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getFranchiseList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getTopFranchise ──────────────────────────────────────────────────────────

describe('getTopFranchise', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopFranchise calls Franchise.aggregate with a $project,
   * $sort by length descending, and $limit:1 pipeline and returns 200.
   */
  it('should return 200 with the top franchise from aggregate', async () => {
    const topFranchise = [{ _id: 'f1', name: 'The Dark Knight', length: 3 }];
    mockFranchiseAggregate.mockResolvedValue(topFranchise as any);
    const req = makeReq();
    const res = makeRes();

    await getTopFranchise(req, res);

    expect(mockFranchiseAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { length: -1 } }),
        expect.objectContaining({ $limit: 1 })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(topFranchise);
  });

  /**
   * Verifies that getTopFranchise returns a 500 error response
   * when Franchise.aggregate rejects.
   */
  it('should return 500 when Franchise.aggregate throws', async () => {
    mockFranchiseAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopFranchise(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getFranchiseCount ──────────────────────────────────────────────────────────

describe('getFranchiseCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getFranchiseCount calls Franchise.aggregate with a $match
   * (universe: $exists: false), $project, and $sort by name pipeline and returns 200.
   */
  it('should return 200 with franchise count data', async () => {
    const franchiseCountData = [
      { _id: 'f1', name: 'The Dark Knight', length: 3 },
      { _id: 'f2', name: 'Inception', length: 1 }
    ];
    mockFranchiseAggregate.mockResolvedValue(franchiseCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getFranchiseCount(req, res);

    expect(mockFranchiseAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $match: { universe: { $exists: false } } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(franchiseCountData);
  });

  /**
   * Verifies that getFranchiseCount returns a 500 error response
   * when Franchise.aggregate rejects.
   */
  it('should return 500 when Franchise.aggregate throws', async () => {
    mockFranchiseAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getFranchiseCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewFranchise ──────────────────────────────────────────────────────────

describe('addNewFranchise', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewFranchise without a universe param calls Franchise.findOneAndUpdate
   * and returns 200 JSON with 'Records updated successfully' message.
   */
  it('should return 200 JSON when no universe is provided', async () => {
    const doc = { _id: 'f1', name: 'The Dark Knight' };
    mockFranchiseFindOneAndUpdate.mockResolvedValue(doc as any);
    const req = makeReq({ body: { name: 'The Dark Knight', movies: [] } });
    const res = makeRes();

    await addNewFranchise(req, res);

    expect(mockFranchiseFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'The Dark Knight', movies: [] },
      { $set: { name: 'The Dark Knight' } },
      { new: true, upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Records updated successfully' });
    expect(mockUniverseBulkWrite).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewFranchise with a universe param calls Universe.bulkWrite
   * to push the franchise into the universe's franchises array, and returns 200 JSON.
   */
  it('should call Universe.bulkWrite and return 200 JSON when universe is provided', async () => {
    const doc = { _id: 'f1', name: 'The Dark Knight' };
    mockFranchiseFindOneAndUpdate.mockResolvedValue(doc as any);
    mockUniverseBulkWrite.mockResolvedValue({} as any);
    const req = makeReq({ body: { name: 'The Dark Knight', movies: [], universe: 'universe1' } });
    const res = makeRes();

    await addNewFranchise(req, res);

    expect(mockUniverseBulkWrite).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { _id: 'universe1' },
            update: { $push: { franchises: 'f1' } }
          })
        })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Records updated successfully' });
    expect(mockLogInfo).toHaveBeenCalled();
  });

  /**
   * Verifies that addNewFranchise calls logError and still returns 200 JSON
   * when Universe.bulkWrite rejects (error is caught in the .catch chain).
   */
  it('should call logError when Universe.bulkWrite rejects but still return 200', async () => {
    const doc = { _id: 'f1', name: 'The Dark Knight' };
    mockFranchiseFindOneAndUpdate.mockResolvedValue(doc as any);
    mockUniverseBulkWrite.mockRejectedValue(new Error('BulkWrite error') as any);
    const req = makeReq({ body: { name: 'The Dark Knight', movies: [], universe: 'universe1' } });
    const res = makeRes();

    await addNewFranchise(req, res);

    expect(mockLogError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Records updated successfully' });
  });

  /**
   * Verifies that addNewFranchise returns 500 with an error object
   * when Franchise.findOneAndUpdate returns null (failed to create/update).
   */
  it('should return 500 when findOneAndUpdate returns null', async () => {
    mockFranchiseFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'The Dark Knight', movies: [] } });
    const res = makeRes();

    await addNewFranchise(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Failed to create or update franchise' });
  });

  /**
   * Verifies that addNewFranchise returns 400 with the error message
   * when Franchise.findOneAndUpdate throws an Error instance.
   */
  it('should return 400 with error message when findOneAndUpdate throws an Error', async () => {
    mockFranchiseFindOneAndUpdate.mockRejectedValue(new Error('Validation failed') as any);
    const req = makeReq({ body: { name: 'The Dark Knight', movies: [] } });
    const res = makeRes();

    await addNewFranchise(req, res);

    expect(mockLogError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
  });

  /**
   * Verifies that addNewFranchise returns 400 with 'Unknown error occurred'
   * when a non-Error value is thrown.
   */
  it('should return 400 with "Unknown error occurred" when a non-Error is thrown', async () => {
    mockFranchiseFindOneAndUpdate.mockRejectedValue('string error' as any);
    const req = makeReq({ body: { name: 'The Dark Knight', movies: [] } });
    const res = makeRes();

    await addNewFranchise(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});
