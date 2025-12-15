import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

/**
 * Get unique values and their counts for a specific column from a table via DuckDB.
 *
 * @param {string} tableName - The table identifier
 * @param {string} columnName - The column identifier
 * @param {number} limit - Maximum number of results to return (optional)
 * @returns {Promise<Object>} Object with values as keys and counts as values
 */
export async function getColumnValues(
  tableName,
  columnName,
  limit = null,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";
  const offsetClause = offset ? `OFFSET ${offset}` : "";

  const query = `
      SELECT 
        ${escapeColumnName(columnName)} as values
      FROM ${tableName}
      ${limitClause}
      ${offsetClause}
    `;
  try {
    const result = await conn.query(query);
    return result.toArray().map((row) => row.values);
  } catch (error) {
    throw new Error(
      `Failed to get value for column ${columnName}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}
