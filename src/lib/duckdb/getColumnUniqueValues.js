/**
 * @fileoverview getColumnUniqueValues Module
 *
 * DuckDB utility for retrieving unique values from a column. Returns distinct
 * values for data exploration and analysis.
 *
 * Features:
 * - Distinct value retrieval
 * - Column name escaping
 * - Array result format
 *
 * @module lib/duckdb/getColumnUniqueValues
 *
 * @example
 * const uniqueValues = await getColumnUniqueValues(db, 'my_table', 'category');
 */

import duckdb from "@duckdb/duckdb-wasm";
import { escapeColumnName } from "./utilities";

/**
 * Get unique values for a specific column from an OpenRefine table via DuckDB.
 *
 * @param {} db
 * @param {*} tableName
 * @param {*} databaseName
 */
async function getColumnUniqueValues(db, tableId, databaseName) {
  const conn = await db.connect();
  const result = await conn.query(
    `select distinct ${escapeColumnName(databaseName)} from ${tableId}`
  );

  await conn.close();
}
