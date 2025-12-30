/**
 * @fileoverview getColumnNames Module
 *
 * DuckDB utility for retrieving column names from a table. Queries the information
 * schema to get ordered column names.
 *
 * Features:
 * - Column name retrieval by table ID
 * - Ordered by ordinal position
 * - Information schema query
 *
 * @module lib/duckdb/getColumnNames
 *
 * @example
 * const columnNames = await getColumnNames('my_table');
 * // Returns: ['id', 'name', 'email', ...]
 */

import { getDuckDB } from "./duckdbClient";

export async function getColumnNames(tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `SELECT column_name 
        FROM information_schema.columns
        WHERE table_name = '${tableId}'
        ORDER BY ordinal_position ASC;
    `
  );

  await conn.close();
  return result.toArray().map((row) => Object.values(row)[0]);
}
