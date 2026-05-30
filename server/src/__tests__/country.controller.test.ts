import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// ─── Mock all mongoose models ──────────────────────────────────────────────────
vi.mock('../schemaModels/country.js', () => ({
  Country: {
    aggregate: vi.fn(),
    findOneAndUpdate: vi.fn()
  }
}));

// ─── Import mocked modules AFTER vi.mock declarations ─────────────────────────
import { Country } from '../schemaModels/country.js';
import { getCountryList, addNewCountry } from '../controllers/country.js';

// ─── Typed mock accessors ──────────────────────────────────────────────────────
const mockCountryAggregate = vi.mocked(Country.aggregate);
const mockCountryFindOneAndUpdate = vi.mocked(Country.findOneAndUpdate);

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

// ─── getCountryList ───────────────────────────────────────────────────────────

describe('getCountryList', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that getCountryList calls Country.aggregate with the correct
   * $project and $sort pipeline and returns a 200 response with the results.
   */
  it('should return 200 with sorted country list', async () => {
    const sampleCountries = [
      { _id: 'c1', name: 'France' },
      { _id: 'c2', name: 'USA' }
    ];
    mockCountryAggregate.mockResolvedValue(sampleCountries as any);
    const req = makeReq();
    const res = makeRes();

    await getCountryList(req, res);

    expect(mockCountryAggregate).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ $project: { name: 1 } }),
        expect.objectContaining({ $sort: { name: 1 } })
      ])
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(sampleCountries);
  });

  /**
   * Verifies that getCountryList returns a 500 error response
   * when Country.aggregate rejects with an error.
   */
  it('should return 500 when Country.aggregate throws', async () => {
    mockCountryAggregate.mockRejectedValue(new Error('DB error') as any);
    const req = makeReq();
    const res = makeRes();

    await getCountryList(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: expect.any(Error) });
  });

  /**
   * Verifies that getCountryList returns an empty array when
   * Country.aggregate resolves with no results.
   */
  it('should return 200 with empty array when no countries exist', async () => {
    mockCountryAggregate.mockResolvedValue([] as any);
    const req = makeReq();
    const res = makeRes();

    await getCountryList(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith([]);
  });
});

// ─── addNewCountry ─────────────────────────────────────────────────────────────

describe('addNewCountry', () => {
  beforeEach(() => vi.clearAllMocks());

  /**
   * Verifies that addNewCountry calls Country.findOneAndUpdate with the correct
   * query and options, and returns a 200 response when a doc is found/created.
   */
  it('should return 200 with success message when doc is returned', async () => {
    const existingDoc = { _id: 'c1', name: 'France' };
    mockCountryFindOneAndUpdate.mockResolvedValue(existingDoc as any);
    const req = makeReq({ body: { name: 'France' } });
    const res = makeRes();

    await addNewCountry(req, res);

    expect(mockCountryFindOneAndUpdate).toHaveBeenCalledWith(
      { name: 'France' },
      { name: 'France' },
      { upsert: true, useFindAndModify: false }
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith('New Country Successfully added.');
  });

  /**
   * Verifies that addNewCountry does NOT send any response when doc is null/falsy
   * (this is the actual behavior — no else branch exists for the null case).
   */
  it('should not send a response when doc is null (no else branch)', async () => {
    mockCountryFindOneAndUpdate.mockResolvedValue(null as any);
    const req = makeReq({ body: { name: 'New Country' } });
    const res = makeRes();

    await addNewCountry(req, res);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
  });

  /**
   * Verifies that addNewCountry returns a 500 error response with the
   * error message string when Country.findOneAndUpdate throws an Error instance.
   */
  it('should return 500 with error message when findOneAndUpdate throws an Error', async () => {
    mockCountryFindOneAndUpdate.mockRejectedValue(new Error('Duplicate key') as any);
    const req = makeReq({ body: { name: 'France' } });
    const res = makeRes();

    await addNewCountry(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Duplicate key' });
  });

  /**
   * Verifies that addNewCountry returns a 500 error response with
   * 'Unknown error occurred' when a non-Error value is thrown.
   */
  it('should return 500 with "Unknown error occurred" when a non-Error is thrown', async () => {
    mockCountryFindOneAndUpdate.mockRejectedValue('string error' as any);
    const req = makeReq({ body: { name: 'France' } });
    const res = makeRes();

    await addNewCountry(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ error: 'Unknown error occurred' });
  });
});
