/**
 * @fileoverview DuckDB virtual file system registration utilities.
 * @module lib/duckdb/registerFiles/registerFiles
 *
 * Provides functionality to register files in DuckDB's virtual file system.
 * Enables loading user files (like CSV) into DuckDB for querying.
 *
 * Features:
 * - Registers single files to virtual FS
 * - Batch registers multiple files in parallel
 * - Reads file content as text
 * - Supports File API objects
 *
 * @example
 * import { registerFile, registerFiles } from './registerFiles';
 *
 * // Single file
 * await registerFile(fileInput.files[0]);
 *
 * // Multiple files
 * await registerFiles(Array.from(fileInput.files));
 */
import { getDuckDB } from "../duckdbClient";

// Register a single file in DuckDB's virtual FS
export async function registerFile(file, db) {
  const duckdb = db || (await getDuckDB());
  const text = await file.text();
  return duckdb.registerFileText(file.name, text);
}

// Register multiple files in DuckDB's virtual FS
export async function registerFiles(files) {
  const db = await getDuckDB();
  return Promise.all(files.map((file) => registerFile(file, db)));
}
