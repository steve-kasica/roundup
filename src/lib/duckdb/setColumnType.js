/**
 * @fileoverview DuckDB column type modification utility.
 * @module lib/duckdb/setColumnType
 *
 * Provides functionality to change the data type of an existing column.
 *
 * Features:
 * - Alters column data type in place
 * - Safe column name escaping
 * - Supports all DuckDB data types
 * - Type coercion handled by DuckDB
 *
 * @example
 * import { setColumnType } from './setColumnType';
 * // Convert string column to integer
 * await setColumnType('users', 'age', 'INTEGER');
 *
 * @example
 * // Convert to date type
 * await setColumnType('events', 'created_at', 'DATE');
 */
import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

export async function setColumnType(tableId, columnName, newType) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `ALTER TABLE "${tableId}" ALTER COLUMN ${escapeColumnName(
    columnName
  )} SET DATA TYPE ${newType}`;
  const result = await conn.query(query);
  await conn.close();
  return result.toArray();
}
