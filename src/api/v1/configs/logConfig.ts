/**
 * @file logConfig.ts
 * @author Philippe Tang
 * @date 2024-02-22
 * @description User-configurable settings for the Log Service
 */

export const VAR_LOG_DIR = process.env.VAR_LOG_DIR ?? "/var/log";
export const DEFAULT_BUFFER_CHUNK_SIZE_BYTES = 1024;
export const DEFAULT_BUFFER_ENCODING = "utf-8";
export const DEFAULT_TAIL_ENTRIES = 10;
export const LOGGER_LEVEL = "debug";
export const APP_NAME = "log-agent";
