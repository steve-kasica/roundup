/**
 * @fileoverview dropTable Module
 *
 * DuckDB utility for dropping tables from the database. Executes DROP TABLE
 * statements to remove tables.
 *
 * Features:
 * - Table deletion by name
 * - Connection management
 *
 * @module lib/duckdb/dropTable
 *
 * @example
 * await dropTable('my_table');
 */

import { getDuckDB } from "./duckdbClient";

// TODO: replace with table.id
export async function dropTable(tableName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(`DROP TABLE ${tableName}`);
  await conn.close();
  return result;
}
