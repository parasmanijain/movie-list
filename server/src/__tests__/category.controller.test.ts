import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/category.js', () => ({
  Category: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

vi.mock('../schemaModels/award.js', () => ({
  Award: {
    bulkWrite: vi.fn()
  }
}));

vi.mock('../utils/logger.js', () => ({
  logInfo: vi.fn(),
  logError: vi.fn()
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Category } from '../schemaModels/category.js';
import { Award } from '../schemaModels/award.js';
import { logInfo, logError } from '../utils/logger.js';
import {
  getCategoryList,
  getTopCategory,
  getCategoryCount,
  addNewCategory
} from '../controllers/category.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockCategoryFind = vi.mocked(Category.find);
const mockCategoryAggregate = vi.mocked(Category.aggregate);
const mockCategoryFindOneAndUpdate = vi.mocked(Category.findOneAndUpdate);
const mockAwardBulkWrite = vi.mocked(Award.bulkWrite);
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

/** Builds a chainable populate chain that resolves to `resolvedValue`. */
const makePopulateChain = (resolvedValue: unknown) => {
  const chain: Record<string, unknown> = {};
  const populateFn = vi.fn(() => chain);
  chain.populate = populateFn;
  chain.then = vi.fn((cb: Function) => Promise.resolve(cb(resolvedValue)));
  // Make it thenable / awaitable
  return Object.assign(Promise.resolve(resolvedValue), chain);
};

// ─── getCategoryList ───────────────────────────────────────────────────────────

describe('getCategoryList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getCategoryList calls Category.find with the correct filter
   * (award: $exists: false), populates movies and award, and returns 200 with results.
   */
  it('should return 200 with category list using find and populate', async () => {
    const sampleCategories = [
      { _id: 'cat1', name: 'Best Picture', movies: [] }
    ];
    // Category.find returns a chain with .populate().populate() that resolves
    const populateChain = {
      populate: vi.fn()
    };
    populateChain.populate.mockReturnValueOnce(populateChain).mockResolvedValueOnce(sampleCategories);
    mockCategoryFind.mockReturnValue(populateChain as any);

    const req = makeReq();
    const res = makeRes();

    await getCategoryList(req, res);

    expect(mockCategoryFind).toHaveBeenCalledWith(
      { award: { $exists: false } },
      null,
      { sort: { name: 1 } }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleCategories);
  });

  /**
   * Verifies that getCategoryList returns a 500 error response
   * when Category.find throws an error.
   */
  it('should return 500 when Category.find throws', async () => {
    mockCategoryFind.mockImplementation(() => { throw new Error('DB error'); });
    const req = makeReq();
    const res = makeRes();

    await getCategoryList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getTopCategory ───────────────────────────────────────────────────────────

describe('getTopCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopCategory calls Category.aggregate with a $project,
   * $sort, and $limit pipeline and returns a 200 response with the top category.
   */
  it('should return 200 with the top category from aggregate', async () => {
    const topCategory = [{ _id: 'cat1', name: 'Best Picture', length: 10 }];
    mockCategoryAggregate.mockResolvedValue(topCategory as any);
    const req = makeReq();
    const res = makeRes();

    await getTopCategory(req, res);

    expect(mockCategoryAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { length: -1 } }),
        expect.objectContaining({ $limit: 1 })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(topCategory);
  });

  /**
   * Verifies that getTopCategory returns a 500 error response
   * when Category.aggregate rejects.
   */
  it('should return 500 when Category.aggregate throws', async () => {
    mockCategoryAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getCategoryCount ──────────────────────────────────────────────────────────

describe('getCategoryCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getCategoryCount calls Category.aggregate with a $match
   * (award: $exists: false), $project, and $sort pipeline and returns 200.
   */
  it('should return 200 with category count data', async () => {
    const categoryCountData = [
      { _id: 'cat1', name: 'Best Picture', length: 5 },
      { _id: 'cat2', name: 'Best Director', length: 3 }
    ];
    mockCategoryAggregate.mockResolvedValue(categoryCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getCategoryCount(req, res);

    expect(mockCategoryAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $match: { award: { $exists: false } } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(categoryCountData);
  });

  /**
   * Verifies that getCategoryCount returns a 500 error response
   * when Category.aggregate rejects.
   */
  it('should return 500 when Category.aggregate throws', async () => {
    mockCategoryAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getCategoryCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewCategory ───────────────────────────────────────────────────────────

describe('addNewCategory', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewCategory without an award param calls Category.findOneAndUpdate
   * and returns 200 with 'Category Successfully Added' message.
   */
  it('should return 200 with success message when no award is provided', async () => {
    const doc = { _id: 'cat1', name: 'Best Picture' };
    mockCategoryFindOneAndUpdate.mockResolvedValue(doc as any);
    const req = makeReq({ body: { name: 'Best Picture', movies: [] } });
    const res = makeRes();

    await addNewCategory(req, res);

    expect(mockCategoryFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Best Picture', movies: [] },
      { $set: { name: 'Best Picture' } },
      { new: true, upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('Category Successfully Added');
    expect(mockAwardBulkWrite).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewCategory with an award param calls Award.bulkWrite
   * to push the category into the award's categories array, and returns 200 with JSON.
   */
  it('should call Award.bulkWrite and return 200 JSON when award is provided', async () => {
    const doc = { _id: 'cat1', name: 'Best Picture' };
    mockCategoryFindOneAndUpdate.mockResolvedValue(doc as any);
    mockAwardBulkWrite.mockResolvedValue({} as any);
    const req = makeReq({ body: { name: 'Best Picture', movies: [], award: 'award1' } });
    const res = makeRes();

    await addNewCategory(req, res);

    expect(mockCategoryFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Best Picture', movies: [], award: 'award1' },
      { $set: { name: 'Best Picture' } },
      { new: true, upsert: true, useFindAndModify: false }
    );
    expect(mockAwardBulkWrite).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          updateOne: expect.objectContaining({
            filter: { _id: 'award1' },
            update: { $push: { categories: 'cat1' } }
          })
        })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Record updated successfully' });
    expect(mockLogInfo).toHaveBeenCalled();
  });

  /**
   * Verifies that addNewCategory calls logError and still returns 200 JSON
   * when Award.bulkWrite rejects (error is caught in the .catch chain).
   */
  it('should call logError when Award.bulkWrite rejects but still return 200', async () => {
    const doc = { _id: 'cat1', name: 'Best Picture' };
    mockCategoryFindOneAndUpdate.mockResolvedValue(doc as any);
    mockAwardBulkWrite.mockRejectedValue(new Error('BulkWrite error') as any);
    const req = makeReq({ body: { name: 'Best Picture', movies: [], award: 'award1' } });
    const res = makeRes();

    await addNewCategory(req, res);

    expect(mockLogError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Record updated successfully' });
  });

  /**
   * Verifies that addNewCategory returns 500 with an error object
   * when Category.findOneAndUpdate returns null (failed to create/update).
   */
  it('should return 500 when findOneAndUpdate returns null', async () => {
    mockCategoryFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'Best Picture', movies: [] } });
    const res = makeRes();

    await addNewCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Failed to create or update category' });
  });

  /**
   * Verifies that addNewCategory returns 400 with the error message
   * when Category.findOneAndUpdate throws an Error instance.
   */
  it('should return 400 with error message when findOneAndUpdate throws an Error', async () => {
    mockCategoryFindOneAndUpdate.mockRejectedValue(new Error('Validation failed') as any);
    const req = makeReq({ body: { name: 'Best Picture', movies: [] } });
    const res = makeRes();

    await addNewCategory(req, res);

    expect(mockLogError).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Validation failed' });
  });

  /**
   * Verifies that addNewCategory returns 400 with 'Unknown error occurred'
   * when a non-Error value is thrown.
   */
  it('should return 400 with "Unknown error occurred" when a non-Error is thrown', async () => {
    mockCategoryFindOneAndUpdate.mockRejectedValue('string error' as any);
    const req = makeReq({ body: { name: 'Best Picture', movies: [] } });
    const res = makeRes();

    await addNewCategory(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});
