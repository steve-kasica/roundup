import { getDuckDB } from "./duckdbClient";

/**
 * Get unique values and their counts for a specific column from a table via DuckDB.
 *
 * @param {string} tableName - The table identifier
 * @param {string} databaseName - The column identifier
 * @param {number} limit - Maximum number of results to return (optional)
 * @param {number} offset - Number of results to skip (optional, for pagination)
 * @returns {Promise<Object>} Object with values as keys and counts as values
 */
export async function getValueCounts(
  tableName,
  columnName,
  limit = null,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

  const columnTypeQuery = `
    SELECT TYPEOF("${columnName}") as column_type
    FROM "${tableName}"
    LIMIT 1
  `;
  const columnTypeResult = await conn.query(columnTypeQuery);
  const columnType =
    columnTypeResult.toArray().length > 0
      ? columnTypeResult.toArray()[0].column_type
      : null;

  const query = `
      SELECT 
        "${columnName}" as value,
        COUNT(*) as count
      FROM "${tableName}" 
      WHERE "${columnName}" IS NOT NULL
      GROUP BY "${columnName}"
      ORDER BY count DESC
      ${limitClause}
      ${offsetClause}
    `;
  try {
    const result = await conn.query(query);

    console.log("Value Counts Result:", result.toArray(), { columnType });
    return result.toArray().map((row) => ({
      value:
        columnType === "DATE"
          ? new Date(row.value).toLocaleDateString()
          : String(row.value),
      count: typeof row.count === "bigint" ? Number(row.count) : row.count,
    }));
  } catch (error) {
    throw new Error(
      `Failed to get value counts for column ${columnName}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}

// TODO: pagination should be handled via a hook below

/**
 * Get paginated value counts with metadata for lazy loading
 *
 * @param {string} tableName - The table identifier
 * @param {string} columnName - The column identifier
 * @param {number} limit - Number of results per page
 * @param {number} offset - Number of results to skip
 * @returns {Promise<Object>} Object with data, hasMore, and total count
 */
export async function getPaginatedValueCounts(
  tableName,
  columnName,
  columnType,
  limit = 100,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total count of unique values
    const totalQuery = `
      SELECT COUNT(DISTINCT "${columnName}") as total
      FROM "${tableName}" 
      WHERE "${columnName}" IS NOT NULL
    `;
    const totalResult = await conn.query(totalQuery);
    const total = Number(totalResult.toArray()[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT 
        "${columnName}" as value,
        COUNT(*) as count
      FROM "${tableName}" 
      WHERE "${columnName}" IS NOT NULL
      GROUP BY "${columnName}"
      ORDER BY count DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const dataResult = await conn.query(dataQuery);

    console.log("Data Result:", dataResult.toArray(), { columnType });
    const data = dataResult.toArray().map((row) => ({
      value:
        columnType === "DATE"
          ? new Date(row.value).toLocaleDateString()
          : String(row.value),
      count: typeof row.count === "bigint" ? Number(row.count) : row.count,
    }));

    return {
      data,
      hasMore: offset + limit < total,
      total,
      offset,
      limit,
      currentCount: data.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to get paginated value counts for column ${columnName}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}

/**
 * Get value counts for multiple columns at once
 *
 * @param {string} tableName - The table identifier
 * @param {Array<string>} columnNames - Array of column identifiers
 * @param {number} limit - Maximum number of results per column
 * @param {number} offset - Number of results to skip per column
 * @returns {Promise<Object>} Object with databaseName as keys and value counts as values
 */
export async function getMultipleValueCounts(
  tableName,
  databaseNames,
  limit = 100,
  offset = 0
) {
  const results = {};

  for (const databaseName of databaseNames) {
    try {
      results[databaseName] = await getValueCounts(
        tableName,
        databaseName,
        limit,
        offset
      );
    } catch (error) {
      console.warn(
        `Failed to get value counts for column ${databaseName}:`,
        error
      );
      results[databaseName] = [];
    }
  }

  return results;
}

/**
 * Get value counts for multiple columns with pagination support
 *
 * @param {string} tableName - The table identifier
 * @param {Array<string>} databaseNames - Array of column identifiers
 * @param {number} limit - Maximum number of results per column
 * @param {number} offset - Number of results to skip per column
 * @returns {Promise<Object>} Object with databaseName as keys and paginated results as values
 */
export async function getMultiplePaginatedValueCounts(
  tableName,
  databaseNames,
  limit = 100,
  offset = 0
) {
  const results = {};

  for (const databaseName of databaseNames) {
    try {
      results[databaseName] = await getPaginatedValueCounts(
        tableName,
        databaseName,
        limit,
        offset
      );
    } catch (error) {
      console.warn(
        `Failed to get paginated value counts for column ${databaseName}:`,
        error
      );
      results[databaseName] = {
        data: [],
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
