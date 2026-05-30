import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { MockInstance } from 'vitest';

// ─── Mock fs BEFORE importing logger ───────────────────────────────────────────
vi.mock('fs', () => {
  const appendFileSync = vi.fn();
  const existsSync = vi.fn(() => true);
  const mkdirSync = vi.fn();
  return { default: { appendFileSync, existsSync, mkdirSync } };
});

import fs from 'fs';
import { logInfo, logWarn, logError } from '../utils/logger.js';

const mockedAppendFileSync = fs.appendFileSync as unknown as MockInstance;
const mockedExistsSync = fs.existsSync as unknown as MockInstance;

describe('logger utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: directory exists so mkdirSync is not called
    mockedExistsSync.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── logInfo ────────────────────────────────────────────────────────────────

  describe('logInfo', () => {
    /**
     * Verifies that logInfo writes a valid JSON log entry to the file
     * with level=INFO, the correct apiName and message fields.
     */
    it('should write a JSON log entry with level INFO to the log file', () => {
      logInfo('GET /movies', 'Fetched movie list');

      expect(mockedAppendFileSync).toHaveBeenCalledOnce();
      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.level).toBe('INFO');
      expect(entry.apiName).toBe('GET /movies');
      expect(entry.message).toBe('Fetched movie list');
      expect(typeof entry.timestamp).toBe('string');
    });

    /**
     * Verifies that logInfo does NOT include errorStatus or errorStacktrace
     * fields in the written entry.
     */
    it('should NOT include errorStatus or errorStacktrace in INFO entries', () => {
      logInfo('POST /movie', 'Movie created');

      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.errorStatus).toBeUndefined();
      expect(entry.errorStacktrace).toBeUndefined();
    });

    /**
     * Verifies that the timestamp in the log entry is a valid ISO 8601 string.
     */
    it('should include a valid ISO timestamp in the log entry', () => {
      logInfo('GET /movies', 'test');

      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());
      const date = new Date(entry.timestamp);

      expect(date.toISOString()).toBe(entry.timestamp);
    });
  });

  // ─── logWarn ────────────────────────────────────────────────────────────────

  describe('logWarn', () => {
    /**
     * Verifies that logWarn writes a JSON log entry with level=WARN.
     */
    it('should write a JSON log entry with level WARN', () => {
      logWarn('GET /movies', 'Slow query detected');

      expect(mockedAppendFileSync).toHaveBeenCalledOnce();
      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.level).toBe('WARN');
      expect(entry.apiName).toBe('GET /movies');
      expect(entry.message).toBe('Slow query detected');
    });
  });

  // ─── logError ───────────────────────────────────────────────────────────────

  describe('logError', () => {
    /**
     * Verifies that logError writes a JSON entry with level=ERROR,
     * the correct errorStatus, and captures the stack trace from an Error object.
     */
    it('should write a JSON log entry with level ERROR and capture stack trace', () => {
      const err = new Error('DB connection failed');
      logError('GET /movies', 'Database error', 500, err);

      expect(mockedAppendFileSync).toHaveBeenCalledOnce();
      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.level).toBe('ERROR');
      expect(entry.apiName).toBe('GET /movies');
      expect(entry.message).toBe('Database error');
      expect(entry.errorStatus).toBe(500);
      expect(typeof entry.errorStacktrace).toBe('string');
      expect(entry.errorStacktrace).toContain('DB connection failed');
    });

    /**
     * Verifies that logError handles a string error value by including it
     * directly in the errorStacktrace field.
     */
    it('should handle string error values in errorStacktrace', () => {
      logError('POST /movie', 'Validation failed', 400, 'Invalid input');

      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.errorStacktrace).toBe('Invalid input');
    });

    /**
     * Verifies that logError handles unknown/object error types by JSON-stringifying them.
     */
    it('should JSON-stringify non-Error, non-string error values', () => {
      logError('POST /movie', 'Unknown error', 500, { code: 42 });

      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.errorStacktrace).toBe(JSON.stringify({ code: 42 }));
    });

    /**
     * Verifies that when no error object is provided, errorStacktrace is undefined.
     */
    it('should set errorStacktrace to undefined when no error is provided', () => {
      logError('GET /movies', 'Something went wrong', 500);

      const [, rawEntry] = mockedAppendFileSync.mock.calls[0] as [string, string, string];
      const entry = JSON.parse(rawEntry.trim());

      expect(entry.errorStacktrace).toBeUndefined();
    });

    /**
     * Verifies that when fs.appendFileSync throws, the logger falls back to
     * writing to process.stderr instead of propagating the exception.
     */
    it('should fall back to stderr when file write fails', () => {
      mockedAppendFileSync.mockImplementationOnce(() => {
        throw new Error('Disk full');
      });

      const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

      expect(() => logError('GET /movies', 'test', 500)).not.toThrow();
      expect(stderrSpy).toHaveBeenCalledOnce();
      expect((stderrSpy.mock.calls[0] as [string])[0]).toContain('[LOGGER ERROR]');

      stderrSpy.mockRestore();
    });
  });
});
