import { getDuckDB } from "./duckdbClient";

/**
 * Get unique values and their counts for a specific column from a table via DuckDB.
 *
 * @param {string} tableId - The table identifier
 * @param {string} databaseName - The column identifier
 * @param {number} limit - Maximum number of results to return (optional)
 * @returns {Promise<Object>} Object with values as keys and counts as values
 */
export async function getColumnValues(
  tableId,
  databaseName,
  limit = null,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";
  const offsetClause = offset ? `OFFSET ${offset}` : "";

  const query = `
      SELECT 
        ${databaseName} as values
      FROM ${tableId}
      ${limitClause}
      ${offsetClause}
    `;
  try {
    const result = await conn.query(query);
    return result.toArray().map((row) => row.values);
  } catch (error) {
    throw new Error(
      `Failed to get value for column ${databaseName}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}
