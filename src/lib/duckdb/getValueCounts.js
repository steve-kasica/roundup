import { getDuckDB } from "./duckdbClient";

/**
 * Get unique values and their counts for a specific column from a table via DuckDB.
 *
 * @param {string} tableId - The table identifier
 * @param {string} columnId - The column identifier
 * @param {number} limit - Maximum number of results to return (optional)
 * @param {number} offset - Number of results to skip (optional, for pagination)
 * @returns {Promise<Object>} Object with values as keys and counts as values
 */
export async function getValueCounts(
  tableId,
  columnId,
  limit = null,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

  const query = `
      SELECT 
        "${columnId}" as value,
        COUNT(*) as count
      FROM "${tableId}" 
      WHERE "${columnId}" IS NOT NULL
      GROUP BY "${columnId}"
      ORDER BY count DESC
      ${limitClause}
      ${offsetClause}
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
 * Get paginated value counts with metadata for lazy loading
 *
 * @param {string} tableId - The table identifier
 * @param {string} columnId - The column identifier
 * @param {number} limit - Number of results per page
 * @param {number} offset - Number of results to skip
 * @returns {Promise<Object>} Object with data, hasMore, and total count
 */
export async function getPaginatedValueCounts(
  tableId,
  columnId,
  limit = 100,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total count of unique values
    const totalQuery = `
      SELECT COUNT(DISTINCT "${columnId}") as total
      FROM "${tableId}" 
      WHERE "${columnId}" IS NOT NULL
    `;
    const totalResult = await conn.query(totalQuery);
    const total = Number(totalResult.toArray()[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT 
        "${columnId}" as value,
        COUNT(*) as count
      FROM "${tableId}" 
      WHERE "${columnId}" IS NOT NULL
      GROUP BY "${columnId}"
      ORDER BY count DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const dataResult = await conn.query(dataQuery);

    const data = dataResult.toArray().reduce((acc, row) => {
      acc[row.value] =
        typeof row.count === "bigint" ? Number(row.count) : row.count;
      return acc;
    }, {});

    return {
      data,
      hasMore: offset + limit < total,
      total,
      offset,
      limit,
      currentCount: Object.keys(data).length,
    };
  } catch (error) {
    throw new Error(
      `Failed to get paginated value counts for column ${columnId}: ${error.message}`
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
 * @param {number} offset - Number of results to skip per column
 * @returns {Promise<Object>} Object with columnId as keys and value counts as values
 */
export async function getMultipleValueCounts(
  tableId,
  columnIds,
  limit = 100,
  offset = 0
) {
  const results = {};

  for (const columnId of columnIds) {
    try {
      results[columnId] = await getValueCounts(
        tableId,
        columnId,
        limit,
        offset
      );
    } catch (error) {
      console.warn(`Failed to get value counts for column ${columnId}:`, error);
      results[columnId] = {};
    }
  }

  return results;
}

/**
 * Get value counts for multiple columns with pagination support
 *
 * @param {string} tableId - The table identifier
 * @param {Array<string>} columnIds - Array of column identifiers
 * @param {number} limit - Maximum number of results per column
 * @param {number} offset - Number of results to skip per column
 * @returns {Promise<Object>} Object with columnId as keys and paginated results as values
 */
export async function getMultiplePaginatedValueCounts(
  tableId,
  columnIds,
  limit = 100,
  offset = 0
) {
  const results = {};

  for (const columnId of columnIds) {
    try {
      results[columnId] = await getPaginatedValueCounts(
        tableId,
        columnId,
        limit,
        offset
      );
    } catch (error) {
      console.warn(
        `Failed to get paginated value counts for column ${columnId}:`,
        error
      );
      results[columnId] = {
        data: {},
        hasMore: false,
        total: 0,
        offset,
        limit,
        currentCount: 0,
      };
    }
  }

  return results;
}
