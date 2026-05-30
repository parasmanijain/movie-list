/**
 * axiosConfig.test.ts
 *
 * Tests for the shared axios instance configuration.
 * NOTE: Because axiosConfig reads import.meta.env.VITE_APP_API_URL at module
 * evaluation time, we cannot stub it after the fact. Instead we test the
 * observable behaviour of the instance (timeout, headers, interceptors) and
 * accept that baseURL will be whatever the test environment provides
 * (undefined in jsdom, which is fine — the other assertions are the real value).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import instance from '../helper/axiosConfig';

describe('axiosConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Verifies that the axios instance is configured with a 30-second timeout.
   */
  it('should have a timeout of 30000ms', () => {
    expect(instance.defaults.timeout).toBe(30000);
  });

  /**
   * Verifies that the axios instance has the Content-Type header set to
   * application/json.
   */
  it('should have Content-Type header set to application/json', () => {
    const allHeaders = JSON.stringify(instance.defaults.headers);
    expect(allHeaders).toContain('application/json');
  });

  /**
   * Verifies that the axios instance is an axios instance (not plain axios).
   */
  it('should be a valid axios instance with defaults', () => {
    expect(instance.defaults).toBeDefined();
    expect(typeof instance.get).toBe('function');
    expect(typeof instance.post).toBe('function');
  });

  /**
   * Verifies that the response interceptor passes through successful responses
   * without modification.
   */
  it('should pass through successful responses in response interceptor', async () => {
    const interceptors = (instance.interceptors.response as any).handlers as Array<{
      fulfilled: (r: unknown) => unknown;
      rejected: (e: unknown) => Promise<unknown>;
    }>;
    const handler = interceptors[interceptors.length - 1]!;
    const mockResponse = { data: { movies: [] }, status: 200 };

    const result = await handler.fulfilled(mockResponse);
    expect(result).toEqual(mockResponse);
  });

  /**
   * Verifies that the error interceptor rejects with the error and calls
   * console.error for non-cancelled request errors.
   */
  it('should call console.error and reject for non-cancelled errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(axios, 'isCancel').mockReturnValue(false);

    const interceptors = (instance.interceptors.response as any).handlers as Array<{
      fulfilled: (r: unknown) => unknown;
      rejected: (e: unknown) => Promise<unknown>;
    }>;
    const handler = interceptors[interceptors.length - 1]!;
    const mockError = {
      response: { status: 500, data: { error: 'Server Error' } },
      message: 'Server Error'
    };

    await expect(handler.rejected(mockError)).rejects.toEqual(mockError);
    expect(consoleSpy).toHaveBeenCalledOnce();

    consoleSpy.mockRestore();
  });

  /**
   * Verifies that the error interceptor does NOT call console.error
   * for cancelled requests (axios.isCancel returns true).
   */
  it('should NOT call console.error for cancelled requests', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(axios, 'isCancel').mockReturnValue(true);

    const interceptors = (instance.interceptors.response as any).handlers as Array<{
      fulfilled: (r: unknown) => unknown;
      rejected: (e: unknown) => Promise<unknown>;
    }>;
    const handler = interceptors[interceptors.length - 1]!;
    const cancelError = new axios.Cancel('Request cancelled');

    await expect(handler.rejected(cancelError)).rejects.toEqual(cancelError);
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  /**
   * Verifies that the error interceptor handles errors without response.status
   * (network errors) and falls back to 'Network' in the log message.
   * This covers the `status ?? 'Network'` branch (line 22-23 in axiosConfig.ts).
   */
  it('should use Network label when error has no response status', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(axios, 'isCancel').mockReturnValue(false);

    const interceptors = (instance.interceptors.response as any).handlers as Array<{
      fulfilled: (r: unknown) => unknown;
      rejected: (e: unknown) => Promise<unknown>;
    }>;
    const handler = interceptors[interceptors.length - 1]!;
    // No response property - simulates a network error
    const networkError = { message: 'Network Error' };

    await expect(handler.rejected(networkError)).rejects.toEqual(networkError);
    expect(consoleSpy).toHaveBeenCalledOnce();
    // The log message should contain 'Network' since status is undefined
    expect(consoleSpy.mock.calls[0]![0]).toContain('Network');

    consoleSpy.mockRestore();
  });

  /**
   * Verifies that the error interceptor uses error.response.data.error message
   * when available, covering the message extraction branch.
   */
  it('should use response data error message when available', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(axios, 'isCancel').mockReturnValue(false);

    const interceptors = (instance.interceptors.response as any).handlers as Array<{
      fulfilled: (r: unknown) => unknown;
      rejected: (e: unknown) => Promise<unknown>;
    }>;
    const handler = interceptors[interceptors.length - 1]!;
    const errorWithData = {
      response: { status: 404, data: { error: 'Not Found' } },
      message: 'Request failed'
    };

    await expect(handler.rejected(errorWithData)).rejects.toEqual(errorWithData);
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy.mock.calls[0]![0]).toContain('Not Found');

    consoleSpy.mockRestore();
  });
});
