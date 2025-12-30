/**
 * @fileoverview getTableDimensions Module
 *
 * DuckDB utility for retrieving table dimensions (row and column counts). Works
 * with both tables and views to provide size metadata.
 *
 * Features:
 * - Row count retrieval
 * - Column count retrieval
 * - Works with tables and views
 * - Combined single query
 *
 * @module lib/duckdb/getTableDimensions
 *
 * @example
 * const { rowCount, columnCount } = await getTableDimensions('my_table');
 */

import { getDuckDB } from "./duckdbClient";

// This function retrieves the number of rows and columns in a specified
// DuckDB table (for table objects) or view (for operations).
export async function getTableDimensions(tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT 
    (SELECT COUNT(*) FROM ${tableId}) AS rowCount,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '${tableId}') AS columnCount;
    `;
  const response = await conn.query(query);
  await conn.close();
  const { rowCount, columnCount } = response
    .toArray()
    .map((proxyStruct) => proxyStruct.toJSON())[0];

  // Convert rowCount and columnCount to numbers
  return { rowCount: Number(rowCount), columnCount: Number(columnCount) };
}
