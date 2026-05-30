import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logs directory at server root: server/logs/
const LOGS_DIR = path.resolve(__dirname, '..', '..', 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOGS_DIR, 'app.log');

/**
 * Formats a Date object into a human-readable datetime string.
 * e.g. 2026-05-30T14:23:45.123Z
 */
const getTimestamp = (): string => new Date().toISOString();

/**
 * Appends a log entry to the log file.
 * Each entry is a single JSON line for easy parsing.
 */
const writeToFile = (entry: string): void => {
  try {
    fs.appendFileSync(LOG_FILE, entry + '\n', 'utf8');
  } catch (fileErr) {
    // Fallback: if file write fails, output to stderr (last resort)
    process.stderr.write(`[LOGGER ERROR] Failed to write log: ${fileErr}\n`);
  }
};

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  apiName: string;
  message: string;
  errorStatus?: number;
  errorStacktrace?: string;
}

/**
 * Logs an informational message to the log file.
 * @param apiName - The name of the API route or operation (e.g. 'POST /movie')
 * @param message - Descriptive log message
 */
export const logInfo = (apiName: string, message: string): void => {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'INFO',
    apiName,
    message
  };
  writeToFile(JSON.stringify(entry));
};

/**
 * Logs a warning message to the log file.
 * @param apiName - The name of the API route or operation
 * @param message - Descriptive warning message
 */
export const logWarn = (apiName: string, message: string): void => {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'WARN',
    apiName,
    message
  };
  writeToFile(JSON.stringify(entry));
};

/**
 * Logs an error with full details to the log file.
 * @param apiName - The name of the API route or operation (e.g. 'POST /movie')
 * @param message - Descriptive error message
 * @param errorStatus - HTTP status code or error code
 * @param error - The original Error object (for stacktrace)
 */
export const logError = (
  apiName: string,
  message: string,
  errorStatus: number,
  error?: unknown
): void => {
  const entry: LogEntry = {
    timestamp: getTimestamp(),
    level: 'ERROR',
    apiName,
    message,
    errorStatus,
    errorStacktrace:
      error instanceof Error
        ? error.stack ?? error.message
        : typeof error === 'string'
          ? error
          : JSON.stringify(error)
  };
  writeToFile(JSON.stringify(entry));
};

export default { logInfo, logWarn, logError };
