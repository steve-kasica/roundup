/**
 * @fileoverview getValueCounts Module
 *
 * DuckDB utility for retrieving value frequency counts for a column. Returns unique
 * values with occurrence counts, supporting pagination and minimum count filtering.
 *
 * Features:
 * - Value frequency counting
 * - Pagination support (limit/offset)
 * - Minimum count threshold
 * - Ordered by count (descending)
 * - Object result format (value -> count)
 *
 * @module lib/duckdb/getValueCounts
 *
 * @example
 * const counts = await getValueCounts('my_table', 'category', 100, 0, 10);
 */

import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

/**
 * Get unique values and their counts for a specific column from a table via DuckDB.
 *
 * @param {string} tableName - The table identifier
 * @param {string} databaseName - The column identifier
 * @param {number} limit - Maximum number of results to return (optional)
 * @param {number} offset - Number of results to skip (optional, for pagination)
 * @param {number} minCount - Minimum count threshold; values with counts below this are excluded (default: 10)
 * @returns {Promise<Object>} Object with values as keys and counts as values
 */
export async function getValueCounts(
  tableName,
  columnName,
  limit = null,
  offset = 0,
  minCount = null
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

  const havingClause = minCount ? `HAVING COUNT(*) >= ${minCount}` : "";

  const query = `
      SELECT 
        ${escapeColumnName(columnName)}::VARCHAR as value,
        COUNT(*) as count
      FROM "${tableName}" 
      WHERE ${escapeColumnName(columnName)} IS NOT NULL
      GROUP BY ${escapeColumnName(columnName)}
      ${havingClause}
      ORDER BY count DESC
      ${limitClause}
      ${offsetClause}
    `;
  try {
    const result = await conn.query(query);
    const data = result.toArray().map((row) => ({
      value: String(row.value),
      count: typeof row.count === "bigint" ? Number(row.count) : row.count,
    }));
    return data;
  } catch (error) {
    alert(
      `Failed to get value counts for column ${columnName}: ${error.message}`
    );
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
 * @param {number} minCount - Minimum count threshold; values with counts below this are excluded (default: 10)
 * @returns {Promise<Object>} Object with data, hasMore, and total count
 */
export async function getPaginatedValueCounts(
  tableName,
  columnName,
  limit = 100,
  offset = 0,
  minCount = null
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total count of unique values that meet the minCount threshold
    const havingClause = minCount ? `HAVING COUNT(*) >= ${minCount}` : "";
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM (
        SELECT "${columnName}"::VARCHAR
        FROM "${tableName}" 
        WHERE "${columnName}" IS NOT NULL
        GROUP BY "${columnName}"
        ${havingClause}
      )
    `;
    const totalResult = await conn.query(totalQuery);
    const total = Number(totalResult.toArray()[0].total);

    // Get paginated data
    const dataQuery = `
      SELECT 
        "${columnName}"::VARCHAR as value,
        COUNT(*) as count
      FROM "${tableName}" 
      WHERE "${columnName}" IS NOT NULL
      GROUP BY "${columnName}"
      ${havingClause}
      ORDER BY count DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const dataResult = await conn.query(dataQuery);

    const data = dataResult.toArray().map((row) => ({
      value: String(row.value),
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
 * @param {number} minCount - Minimum count threshold; values with counts below this are excluded (default: 10)
 * @returns {Promise<Object>} Object with databaseName as keys and value counts as values
 */
export async function getMultipleValueCounts(
  tableName,
  databaseNames,
  limit = 100,
  offset = 0,
  minCount = 10
) {
  const results = {};

  for (const databaseName of databaseNames) {
    try {
      results[databaseName] = await getValueCounts(
        tableName,
        databaseName,
        limit,
        offset,
        minCount
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
 * @param {number} minCount - Minimum count threshold; values with counts below this are excluded (default: 10)
 * @returns {Promise<Object>} Object with databaseName as keys and paginated results as values
 */
export async function getMultiplePaginatedValueCounts(
  tableName,
  databaseNames,
  limit = 100,
  offset = 0,
  minCount = 10
) {
  const results = {};

  for (const databaseName of databaseNames) {
    try {
      results[databaseName] = await getPaginatedValueCounts(
        tableName,
        databaseName,
        limit,
        offset,
        minCount
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
