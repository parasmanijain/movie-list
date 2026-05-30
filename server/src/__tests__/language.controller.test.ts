import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/language.js', () => ({
  Language: {
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Language } from '../schemaModels/language.js';
import {
  getLanguageList,
  getTopLanguage,
  getLanguageCount,
  addNewLanguage
} from '../controllers/language.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockLanguageAggregate = vi.mocked(Language.aggregate);
const mockLanguageFindOneAndUpdate = vi.mocked(Language.findOneAndUpdate);

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

// ─── getLanguageList ───────────────────────────────────────────────────────────

describe('getLanguageList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getLanguageList calls Language.aggregate with the correct
   * $project and $sort pipeline and returns a 200 response with the results.
   */
  it('should return 200 with sorted language list', async () => {
    const sampleLanguages = [
      { _id: 'l1', name: 'English' },
      { _id: 'l2', name: 'French' }
    ];
    mockLanguageAggregate.mockResolvedValue(sampleLanguages as any);
    const req = makeReq();
    const res = makeRes();

    await getLanguageList(req, res);

    expect(mockLanguageAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: { name: 1 } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleLanguages);
  });

  /**
   * Verifies that getLanguageList returns a 500 error response
   * when Language.aggregate rejects with an error.
   */
  it('should return 500 when Language.aggregate throws', async () => {
    mockLanguageAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getLanguageList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });

  /**
   * Verifies that getLanguageList returns an empty array when
   * Language.aggregate resolves with no results.
   */
  it('should return 200 with empty array when no languages exist', async () => {
    mockLanguageAggregate.mockResolvedValue([] as any);
    const req = makeReq();
    const res = makeRes();

    await getLanguageList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });
});

// ─── getTopLanguage ───────────────────────────────────────────────────────────

describe('getTopLanguage', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getTopLanguage calls Language.aggregate with a $project,
   * $sort by length descending, and $limit:1 pipeline and returns 200.
   */
  it('should return 200 with the top language from aggregate', async () => {
    const topLanguage = [{ _id: 'l1', name: 'English', length: 200 }];
    mockLanguageAggregate.mockResolvedValue(topLanguage as any);
    const req = makeReq();
    const res = makeRes();

    await getTopLanguage(req, res);

    expect(mockLanguageAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { length: -1 } }),
        expect.objectContaining({ $limit: 1 })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(topLanguage);
  });

  /**
   * Verifies that getTopLanguage returns a 500 error response
   * when Language.aggregate rejects.
   */
  it('should return 500 when Language.aggregate throws', async () => {
    mockLanguageAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getTopLanguage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── getLanguageCount ──────────────────────────────────────────────────────────

describe('getLanguageCount', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getLanguageCount calls Language.aggregate with a $project
   * and $sort by name pipeline and returns 200 with count data.
   */
  it('should return 200 with language count data sorted by name', async () => {
    const languageCountData = [
      { _id: 'l1', name: 'English', length: 200 },
      { _id: 'l2', name: 'French', length: 50 }
    ];
    mockLanguageAggregate.mockResolvedValue(languageCountData as any);
    const req = makeReq();
    const res = makeRes();

    await getLanguageCount(req, res);

    expect(mockLanguageAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(languageCountData);
  });

  /**
   * Verifies that getLanguageCount returns a 500 error response
   * when Language.aggregate rejects.
   */
  it('should return 500 when Language.aggregate throws', async () => {
    mockLanguageAggregate.mockRejectedValue(new Error('Aggregate error') as any);
    const req = makeReq();
    const res = makeRes();

    await getLanguageCount(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});

// ─── addNewLanguage ───────────────────────────────────────────────────────────

describe('addNewLanguage', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewLanguage calls Language.findOneAndUpdate with the correct
   * query (name, code, movies) and options, and returns a 200 response when a doc is found/created.
   */
  it('should return 200 with success message when doc is returned', async () => {
    const existingDoc = { _id: 'l1', name: 'English', code: 'en' };
    mockLanguageFindOneAndUpdate.mockResolvedValue(existingDoc as any);
    const req = makeReq({ body: { name: 'English', code: 'en', movies: ['m1'] } });
    const res = makeRes();

    await addNewLanguage(req, res);

    expect(mockLanguageFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'English', code: 'en', movies: ['m1'] },
      { $set: { name: 'English', code: 'en' } },
      { upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('New Language Successfully added.');
  });

  /**
   * Verifies that addNewLanguage does NOT send any response when doc is null/falsy
   * (this is the actual behavior — no else branch exists for the null case).
   */
  it('should not send a response when doc is null (no else branch)', async () => {
    mockLanguageFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'English', code: 'en', movies: [] } });
    const res = makeRes();

    await addNewLanguage(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewLanguage returns a 500 error response
   * when Language.findOneAndUpdate throws an error.
   */
  it('should return 500 when Language.findOneAndUpdate throws', async () => {
    mockLanguageFindOneAndUpdate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq({ body: { name: 'English', code: 'en', movies: [] } });
    const res = makeRes();

    await addNewLanguage(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });
});
