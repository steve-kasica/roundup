/**
 * @fileoverview DuckDB column renaming utility.
 * @module lib/duckdb/renameColumns
 *
 * Provides functionality to rename multiple columns in a DuckDB table.
 *
 * Features:
 * - Batch rename multiple columns in a single operation
 * - Safe column name escaping for special characters
 * - Validates matching array lengths
 * - Generates optimized multi-statement SQL
 *
 * @example
 * import { renameColumns } from './renameColumns';
 * await renameColumns('users',
 *   ['first', 'last'],
 *   ['firstName', 'lastName']
 * );
 */
import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

export async function renameColumns(tableId, oldNames, newNames) {
  if (oldNames.length !== newNames.length) {
    throw new Error("oldNames and newNames must have the same length");
  }
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = oldNames
    .map(
      (oldName, i) =>
        `ALTER TABLE "${tableId}" RENAME COLUMN ${escapeColumnName(
          oldName
        )} TO ${escapeColumnName(newNames[i])}`
    )
    .join(";\n");
  const result = await conn.query(query);
  await conn.close();
  return result.toArray();
}
