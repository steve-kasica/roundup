/**
 * @fileoverview getTableColumnNames Module
 *
 * DuckDB utility for retrieving table column names from information schema. Works
 * with both tables and views, returning ordered column names.
 *
 * Features:
 * - Column name retrieval for tables and views
 * - Ordinal position filtering
 * - Information schema query
 * - Ordered results
 *
 * @module lib/duckdb/getTableColumnNames
 *
 * @example
 * const columns = await getTableColumnNames('my_table', 0);
 * // Returns: ['id', 'name', 'email', ...]
 */

import { getDuckDB } from "./duckdbClient";

/**
 * Get the column names of a DuckDB table in order
 * This query works on both Tables and Views
 *
 * @param {string} table_name - The name of the table
 * @returns {Promise<string[]>} Array of column names in order
 *
 * Remember that ordinal_position is 1-indexed
 */
export async function getTableColumnNames(table_name, ordinal_position = 0) {
  const db = await getDuckDB();
  const conn = await db.connect();
  let query = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${table_name}'
      ${
        ordinal_position > 0 ? `AND ordinal_position = ${ordinal_position}` : ""
      }
      ORDER BY ordinal_position
    `;

  const response = await conn.query(query);
  await conn.close();
  return response
    .toArray()
    .map((proxyStruct) => proxyStruct.toJSON()["column_name"]);
}
