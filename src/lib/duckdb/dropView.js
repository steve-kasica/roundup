/**
 * @fileoverview dropView Module
 *
 * DuckDB utility for dropping views from the database. Executes DROP VIEW
 * statements to remove operation views.
 *
 * Features:
 * - View deletion by operation ID
 * - Connection management
 *
 * @module lib/duckdb/dropView
 *
 * @example
 * await dropView('operation-123');
 */

import { getDuckDB } from "./duckdbClient";

// TODO: need to update this since operations are now tables
export async function dropView(operationId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `DROP VIEW ${operationId}` // Use backticks for template literals
  );
  await conn.close();
  return result;
}
