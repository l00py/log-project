/**
 * @file logService.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description Log service abstract API used by the log controller. Provides the log file tail capability.
 */
import {
  DEFAULT_BUFFER_CHUNK_SIZE_BYTES,
  DEFAULT_BUFFER_ENCODING,
  DEFAULT_TAIL_ENTRIES,
} from "@/api/v1/configs/logConfig";
import { ILogService, TailLogOptions } from "@/api/v1/interfaces/logInterface";
import * as fs from "fs";

/**
 * Log service that interfaces with the filesystem.
 * @class LogService
 * @implements ILogService
 * @example
 * const logService = new LogService()
 */
export class LogService implements ILogService {
  /**
   * Output the last part of a file.
   * @description
   * Returns the last `n` (default: 10) lines of a file.
   * For text/keyword filter useability:
   * If a text/keyword filter is provided, search all lines using a case insensitive match.
   * Then, return `n` number lines with matching filter (newest/latest first).
   * @param {TailLogOptions} options Configuration for the tailing a file.
   * @returns {string[]} An array of the last `n` lines of the file.
   * @example
   * // returns ["Bar", "bar", "my bar", "barf"]
   * tailLog({
   *  filePath: "/var/log/foo.txt",
   *  n: 5,
   *  filterKeyword: "bar"
   * });
   */
  async tailLog(options: TailLogOptions): Promise<string[]> {
    const { filePath, n = DEFAULT_TAIL_ENTRIES, filterKeyword } = options;

    // Early return if n is outside the valid range n>1
    if (n <= 0) {
      return [];
    }

    /**
     * For text/keyword filter useability
     * If a text/keyword filter is provided, search all lines using a case insensitive match.
     * Then, return `n` number lines (newest/latest first).
     */
    return filterKeyword
      ? await this._grepLinesFromEnd(filePath, n, filterKeyword)
      : await this._tailLogNoFilter(filePath, n);
  }

  private async _tailLogNoFilter(
    filePath: string,
    n: number,
  ): Promise<string[]> {
    try {
      // Retrieves file size used as the starting position for the cursor
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;
      const handle = await fs.promises.open(filePath, "r");
      let position = fileSize;
      // Read data placeholder
      let readData = "";

      // Break out from the loop if n number of lines is met
      while (position > 0 /**&& lineCount !== n+1*/) {
        const currentChunk = await this._readFileChunk(handle, position);
        readData = currentChunk + readData;

        // Break from the loop once we have captured n lines
        if (
          readData.split(/[\r\n]+/).filter((line) => line.trim() !== "")
            .length > n
        ) {
          break;
        }

        // Update position of the cursor for next iteration
        position -= DEFAULT_BUFFER_CHUNK_SIZE_BYTES;
      }

      await handle.close();

      // Filter out empty lines
      const lines = readData
        .split(/[\r\n]+/)
        .filter((line) => line.trim() !== "");
      // Returns newest lines first
      return lines.slice(-n).reverse();
    } catch (error) {
      console.error(`Failed to read file: ${error}`);
      return [];
    }
  }

  private async _grepLinesFromEnd(
    filePath: string,
    n: number,
    filterKeyword: string,
  ): Promise<string[]> {
    try {
      // Retrieves file size used as the starting position for the cursor
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;
      const handle = await fs.promises.open(filePath, "r");
      let position = fileSize;
      // Returned lines with matching text/keyword placeholder
      const lines: string[] = [];
      // Used for stiching a current chunk with the previous chunk fragment
      let lastFragment = "";

      // Break out from the loop if n number of lines is met
      while (position > 0 && lines.length < n) {
        const currentChunk = await this._readFileChunk(handle, position);
        // Update position of the cursor for next iteration
        position -= DEFAULT_BUFFER_CHUNK_SIZE_BYTES;

        // Stich last chunk fragment
        const combinedChunk = currentChunk + lastFragment;
        // Split into lines
        const chunkLines = combinedChunk.split(/[\r\n]+/);
        lastFragment = chunkLines.shift() ?? "";

        // Capture lines with matching text/keyword case insensitive
        chunkLines.reverse().forEach((line) => {
          if (
            line.toLowerCase().includes(filterKeyword.toLowerCase()) &&
            lines.length < n
          ) {
            lines.push(line);
          }
        });
      }

      // Check the last fragment, and capture it if matching text/keyword
      if (
        lastFragment.toLowerCase().includes(filterKeyword.toLowerCase()) &&
        lines.length < n
      ) {
        lines.push(lastFragment);
      }

      await handle.close();
      return lines;
    } catch (error) {
      console.error(`Failed to read file: ${error}`);
      return [];
    }
  }

  private async _readFileChunk(
    fileHandle: fs.promises.FileHandle,
    position: number,
    chunkSize: number = DEFAULT_BUFFER_CHUNK_SIZE_BYTES,
    encoding: BufferEncoding = DEFAULT_BUFFER_ENCODING,
  ): Promise<string> {
    const actualChunkSize = Math.min(chunkSize, position);
    const buffer = Buffer.alloc(actualChunkSize);
    const cursor = position - actualChunkSize;
    const { bytesRead } = await fileHandle.read(
      buffer,
      0,
      actualChunkSize,
      cursor,
    );

    return buffer.toString(encoding, 0, bytesRead);
  }
}
