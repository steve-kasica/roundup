import { getDuckDB } from "./duckdbClient";

/**
 * Get unique values and their counts for a specific column from a table via DuckDB.
 *
 * @param {string} tableId - The table identifier
 * @param {string} columnId - The column identifier
 * @param {number} limit - Maximum number of results to return (optional)
 * @returns {Promise<Object>} Object with values as keys and counts as values
 */
export async function getValueCounts(tableId, columnId, limit = null) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";

  const query = `
      SELECT 
        "${columnId}" as value,
        COUNT(*) as count
      FROM "${tableId}" 
      WHERE "${columnId}" IS NOT NULL
      GROUP BY "${columnId}"
      ORDER BY count DESC
      ${limitClause}
    `;
  try {
    const result = await conn.query(query);

    return result.toArray().reduce((acc, row) => {
      acc[row.value] =
        typeof row.count === "bigint" ? Number(row.count) : row.count;
      return acc;
    }, {});
  } catch (error) {
    throw new Error(
      `Failed to get value counts for column ${columnId}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}

/**
 * Get value counts for multiple columns at once
 *
 * @param {string} tableId - The table identifier
 * @param {Array<string>} columnIds - Array of column identifiers
 * @param {number} limit - Maximum number of results per column
 * @returns {Promise<Object>} Object with columnId as keys and value counts as values
 */
export async function getMultipleValueCounts(tableId, columnIds, limit = 100) {
  const results = {};

  for (const columnId of columnIds) {
    try {
      results[columnId] = await getValueCounts(tableId, columnId, limit);
    } catch (error) {
      console.warn(`Failed to get value counts for column ${columnId}:`, error);
      results[columnId] = [];
    }
  }

  return results;
}
