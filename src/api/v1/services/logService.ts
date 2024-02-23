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
   * @description Returns the last `n` (default: 10) lines of a file.
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

    // Array that will be returned by the method
    let lines: string[] = [];
    // Used for stiching the chunks together
    let lastFragment = "";

    try {
      // Retrieve the file size that will be used as the starting point (reading from the end)
      const stats = await fs.promises.stat(filePath);
      const fileSize = stats.size;

      // Tailing file
      const handle = await fs.promises.open(filePath, "r");
      for (
        let position = fileSize;
        position > 0 && lines.length < n;
        position -= DEFAULT_BUFFER_CHUNK_SIZE_BYTES
      ) {
        // Moving backward by the specified chunk size. Use the cursor position if less than the chunk size
        const actualChunkSize: number = Math.min(
          DEFAULT_BUFFER_CHUNK_SIZE_BYTES,
          position,
        );
        const buffer = Buffer.alloc(actualChunkSize);
        const cursor = Math.max(0, position - actualChunkSize);
        const { bytesRead }: { bytesRead: number } = await handle.read(
          buffer,
          0,
          actualChunkSize,
          cursor,
        );

        const currentChunk: string = buffer.toString(
          DEFAULT_BUFFER_ENCODING,
          0,
          bytesRead,
        );
        const combinedChunk: string = currentChunk + lastFragment;
        const chunkLines: string[] = combinedChunk.split(/\r?\n/);
        lastFragment =
          position > actualChunkSize ? chunkLines.shift() ?? "" : "";

        lines = chunkLines.concat(lines);
      }

      // Stitch any remaining fragment
      if (lastFragment) {
        lines = [lastFragment].concat(lines);
      }

      await handle.close();

      // Filter by keyword. Could be enhanced with regex if needed.
      if (filterKeyword) {
        lines = lines.filter((line) =>
          line.toLowerCase().includes(filterKeyword.toLowerCase()),
        );
      }

      // Ensure returning the last `n` entries
      return lines.slice(-n).reverse();
    } catch (error) {
      console.error(`Failed to read file: ${error}`);
      return [];
    }
  }
}
