import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
// NOTE: vi.mock factories are hoisted — all vi.fn() calls must be inline
vi.mock('../schemaModels/award.js', () => ({
  Award: {
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Award } from '../schemaModels/award.js';
import {
  getAwardList,
  getAwardCategoryList,
  getAwardCount,
  addNewAward
} from '../controllers/award.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockAwardAggregate = vi.mocked(Award.aggregate);
const mockAwardFindOneAndUpdate = vi.mocked(Award.findOneAndUpdate);

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

// ─── Sample data ───────────────────────────────────────────────────────────────
const sampleAwards = [
  { _id: 'award1', name: 'Academy Award' },
  { _id: 'award2', name: 'Golden Globe' }
];

// ─── getAwardList ──────────────────────────────────────────────────────────────

describe('getAwardList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getAwardList calls Award.aggregate with the correct
   * $project and $sort pipeline and returns a 200 response with the results.
   */
  it('should return 200 with sorted award list', async () => {
    mockAwardAggregate.mockResolvedValue(sampleAwards as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardList(req, res);

    expect(mockAwardAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: { name: 1 } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleAwards);
  });

  /**
   * Verifies that getAwardList returns a 500 error response
   * when Award.aggregate rejects with an error.
   */
  it('should return 500 when Award.aggregate throws', async () => {
    mockAwardAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });

  /**
   * Verifies that getAwardList returns an empty array when
   * Award.aggregate resolves with no results.
   */
  it('should return 200 with empty array when no awards exist', async () => {
    mockAwardAggregate.mockResolvedValue([] as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });
});

// ─── getAwardCategoryList ──────────────────────────────────────────────────────

describe('getAwardCategoryList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getAwardCategoryList calls Award.aggregate with a $lookup
   * pipeline and returns a 200 response with award-category data.
   */
  it('should return 200 with award category list', async () => {
    const awardCategoryData = [
      { _id: 'award1', name: 'Academy Award', categories: [{ _id: 'cat1', name: 'Best Picture' }] }
    ];
    mockAwardAggregate.mockResolvedValue(awardCategoryData as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardCategoryList(req, res);

    expect(mockAwardAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $lookup: expect.objectContaining({ from: 'categories' }) })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(awardCategoryData);
  });

  /**
   * Verifies that getAwardCategoryList returns a 500 error response
   * when Award.aggregate rejects with an error.
   */
  it('should return 500 when Award.aggregate throws', async () => {
    mockAwardAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardCategoryList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getAwardCount ─────────────────────────────────────────────────────────────

describe('getAwardCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getAwardCount calls Award.aggregate with a $lookup
   * and $project pipeline and returns a 200 response with count data.
   */
  it('should return 200 with award count data', async () => {
    const awardCountData = [
      {
        _id: 'award1',
        name: 'Academy Award',
        category: [{ name: 'Best Picture', length: 5 }]
      }
    ];
    mockAwardAggregate.mockResolvedValue(awardCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardCount(req, res);

    expect(mockAwardAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $lookup: expect.objectContaining({ from: 'categories' }) }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(awardCountData);
  });

  /**
   * Verifies that getAwardCount returns a 500 error response
   * when Award.aggregate rejects with an error.
   */
  it('should return 500 when Award.aggregate throws', async () => {
    mockAwardAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getAwardCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewAward ───────────────────────────────────────────────────────────────

describe('addNewAward', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewAward calls Award.findOneAndUpdate with the correct
   * query and options, and returns a 200 response when a doc is found/created.
   */
  it('should return 200 with success message when doc is returned', async () => {
    const existingDoc = { _id: 'award1', name: 'Academy Award' };
    mockAwardFindOneAndUpdate.mockResolvedValue(existingDoc as any);
    const req = makeReq({ body: { name: 'Academy Award' } });
    const res = makeRes();

    await addNewAward(req, res);

    expect(mockAwardFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Academy Award' },
      { name: 'Academy Award' },
      { upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('New Award Successfully added.');
  });

  /**
   * Verifies that addNewAward does NOT send any response when doc is null/falsy
   * (this is the actual behavior — no else branch exists for the null case).
   */
  it('should not send a response when doc is null (no else branch)', async () => {
    mockAwardFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'New Award' } });
    const res = makeRes();

    await addNewAward(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewAward returns a 500 error response with the
   * error message string when Award.findOneAndUpdate throws an Error instance.
   */
  it('should return 500 with error message when findOneAndUpdate throws an Error', async () => {
    mockAwardFindOneAndUpdate.mockRejectedValue(new Error('Duplicate key') as any);
    const req = makeReq({ body: { name: 'Academy Award' } });
    const res = makeRes();

    await addNewAward(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Duplicate key' });
  });

  /**
   * Verifies that addNewAward returns a 500 error response with
   * 'Unknown error occurred' when a non-Error value is thrown.
   */
  it('should return 500 with "Unknown error occurred" when a non-Error is thrown', async () => {
    mockAwardFindOneAndUpdate.mockRejectedValue('string error' as any);
    const req = makeReq({ body: { name: 'Academy Award' } });
    const res = makeRes();

    await addNewAward(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});
