/**
 * @file logInterface.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description Interfaces used by the Log Service
 */

/**
 * Http response body object to be returned by the `/logs` endpoint
 * @interface
 */
export interface LogResponse {
  log: Log;
}

/**
 * Log object format to be returned via `LogResponse` response body object
 * @interface
 */
export interface Log {
  filename: string;
  count: number;
  events: string[];
}

/**
 * Parameters interface for tailing a log file
 * @interface
 * @param filePath Path to the log file
 * @param n Number of lines to retrieve
 * @param filterKeyword Text/Keyword to filter
 * @see `IReadLog.tailLog` method
 */
export interface TailLogOptions {
  filePath: string;
  n?: number;
  filterKeyword?: string;
}

/**
 * Interface for reading a log file
 * @interface
 * @see `ILogService` interface
 */
export interface IReadLog {
  tailLog(options?: TailLogOptions): Promise<string[]>;
}

/**
 * Interface for log service classes that implements reading.
 * Inherits all methods from `IReadLog`
 * @extends `IReadLog`
 */
export interface ILogService extends IReadLog {}
