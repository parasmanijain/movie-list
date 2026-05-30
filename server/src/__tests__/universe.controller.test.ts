import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/universe.js', () => ({
  Universe: {
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Universe } from '../schemaModels/universe.js';
import {
  getUniverseList,
  getUniverseFranchiseList,
  getUniverseCount,
  addNewUniverse
} from '../controllers/universe.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockUniverseAggregate = vi.mocked(Universe.aggregate);
const mockUniverseFindOneAndUpdate = vi.mocked(Universe.findOneAndUpdate);

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

// ─── getUniverseList ───────────────────────────────────────────────────────────

describe('getUniverseList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getUniverseList calls Universe.aggregate with the correct
   * $project and $sort pipeline and returns a 200 response with the results.
   */
  it('should return 200 with sorted universe list', async () => {
    const sampleUniverses = [
      { _id: 'u1', name: 'Marvel Cinematic Universe' },
      { _id: 'u2', name: 'DC Extended Universe' }
    ];
    mockUniverseAggregate.mockResolvedValue(sampleUniverses as any);
    const req = makeReq();
    const res = makeRes();

    await getUniverseList(req, res);

    expect(mockUniverseAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: { name: 1 } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleUniverses);
  });

  /**
   * Verifies that getUniverseList returns a 500 error response
   * when Universe.aggregate rejects with an error.
   */
  it('should return 500 when Universe.aggregate throws', async () => {
    mockUniverseAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getUniverseList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getUniverseFranchiseList ───────────────────────────────────────────────────

describe('getUniverseFranchiseList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getUniverseFranchiseList calls Universe.aggregate with a $lookup
   * pipeline joining franchises and returns 200 with universe-franchise data.
   */
  it('should return 200 with universe franchise list', async () => {
    const universeFranchiseData = [
      {
        _id: 'u1',
        name: 'Marvel Cinematic Universe',
        franchises: [{ _id: 'f1', name: 'Avengers' }]
      }
    ];
    mockUniverseAggregate.mockResolvedValue(universeFranchiseData as any);
    const req = makeReq();
    const res = makeRes();

    await getUniverseFranchiseList(req, res);

    expect(mockUniverseAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $lookup: expect.objectContaining({ from: 'franchises' }) })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(universeFranchiseData);
  });

  /**
   * Verifies that getUniverseFranchiseList returns a 500 error response
   * when Universe.aggregate rejects.
   */
  it('should return 500 when Universe.aggregate throws', async () => {
    mockUniverseAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getUniverseFranchiseList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getUniverseCount ──────────────────────────────────────────────────────────

describe('getUniverseCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getUniverseCount calls Universe.aggregate with a $lookup
   * and $project pipeline and returns 200 with count data.
   */
  it('should return 200 with universe count data', async () => {
    const universeCountData = [
      {
        _id: 'u1',
        name: 'Marvel Cinematic Universe',
        franchise: [{ name: 'Avengers', length: 4 }]
      }
    ];
    mockUniverseAggregate.mockResolvedValue(universeCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getUniverseCount(req, res);

    expect(mockUniverseAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $lookup: expect.objectContaining({ from: 'franchises' }) }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(universeCountData);
  });

  /**
   * Verifies that getUniverseCount returns a 500 error response
   * when Universe.aggregate rejects.
   */
  it('should return 500 when Universe.aggregate throws', async () => {
    mockUniverseAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getUniverseCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewUniverse ───────────────────────────────────────────────────────────

describe('addNewUniverse', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewUniverse calls Universe.findOneAndUpdate with the correct
   * query and options, and returns a 200 response when a doc is found/created.
   */
  it('should return 200 with success message when doc is returned', async () => {
    const existingDoc = { _id: 'u1', name: 'Marvel Cinematic Universe' };
    mockUniverseFindOneAndUpdate.mockResolvedValue(existingDoc as any);
    const req = makeReq({ body: { name: 'Marvel Cinematic Universe' } });
    const res = makeRes();

    await addNewUniverse(req, res);

    expect(mockUniverseFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Marvel Cinematic Universe' },
      { name: 'Marvel Cinematic Universe' },
      { upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('New Universe Successfully added.');
  });

  /**
   * Verifies that addNewUniverse does NOT send any response when doc is null/falsy
   * (this is the actual behavior — no else branch exists for the null case).
   */
  it('should not send a response when doc is null (no else branch)', async () => {
    mockUniverseFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'New Universe' } });
    const res = makeRes();

    await addNewUniverse(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewUniverse returns a 500 error response with the
   * error message string when Universe.findOneAndUpdate throws an Error instance.
   */
  it('should return 500 with error message when findOneAndUpdate throws an Error', async () => {
    mockUniverseFindOneAndUpdate.mockRejectedValue(new Error('Duplicate key') as any);
    const req = makeReq({ body: { name: 'Marvel Cinematic Universe' } });
    const res = makeRes();

    await addNewUniverse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Duplicate key' });
  });

  /**
   * Verifies that addNewUniverse returns a 500 error response with
   * 'Unknown error occurred' when a non-Error value is thrown.
   */
  it('should return 500 with "Unknown error occurred" when a non-Error is thrown', async () => {
    mockUniverseFindOneAndUpdate.mockRejectedValue('string error' as any);
    const req = makeReq({ body: { name: 'Marvel Cinematic Universe' } });
    const res = makeRes();

    await addNewUniverse(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});
