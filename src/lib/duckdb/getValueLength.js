import { getDuckDB } from "./duckdbClient";

/**
 * Get unique values grouped by their length for a specific column from a table via DuckDB.
 * Returns the length, count of values with that length, and up to 5 example values.
 *
 * @param {string} tableName - The table identifier
 * @param {string} columnName - The column identifier
 * @param {number} limit - Maximum number of length groups to return (optional)
 * @param {number} offset - Number of results to skip (optional, for pagination)
 * @returns {Promise<Array>} Array of objects with length, count, and examples
 */
export async function getValueLengths(
  tableName,
  columnName,
  limit = null,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  const limitClause = limit !== null ? `LIMIT ${limit}` : "";
  const offsetClause = offset > 0 ? `OFFSET ${offset}` : "";

  const query = `
    WITH length_groups AS (
      SELECT 
        LENGTH(CAST("${columnName}" AS VARCHAR)) as value_length,
        "${columnName}" as value
      FROM "${tableName}"
      WHERE "${columnName}" IS NOT NULL
    ),
    value_counts AS (
      SELECT 
        value_length,
        value,
        COUNT(*) as value_count
      FROM length_groups
      GROUP BY value_length, value
    ),
    length_counts AS (
      SELECT 
        value_length,
        COUNT(DISTINCT value) as distinct_count
      FROM length_groups
      GROUP BY value_length
    ),
    ranked_examples AS (
      SELECT 
        value_length,
        value,
        value_count,
        ROW_NUMBER() OVER (PARTITION BY value_length ORDER BY value_count DESC, value) as rn
      FROM value_counts
    ),
    length_examples AS (
      SELECT 
        value_length,
        LIST(STRUCT_PACK(value := value, count := value_count) ORDER BY value_count DESC, value) as examples
      FROM ranked_examples
      WHERE rn <= 5
      GROUP BY value_length
    )
    SELECT 
      lc.value_length as length,
      lc.distinct_count as count,
      le.examples
    FROM length_counts lc
    JOIN length_examples le ON lc.value_length = le.value_length
    ORDER BY lc.value_length ASC
    ${limitClause}
    ${offsetClause}
  `;

  try {
    const result = await conn.query(query);

    return result.toArray().map((row) => ({
      length: row.length,
      count: typeof row.count === "bigint" ? Number(row.count) : row.count,
      examples: Array.isArray(row.examples)
        ? row.examples.map((ex) => ({
            value: String(ex.value),
            count: typeof ex.count === "bigint" ? Number(ex.count) : ex.count,
          }))
        : row.examples
        ? Array.from(row.examples).map((ex) => ({
            value: String(ex.value),
            count: typeof ex.count === "bigint" ? Number(ex.count) : ex.count,
          }))
        : [],
    }));
  } catch (error) {
    throw new Error(
      `Failed to get value lengths for column ${columnName}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}

/**
 * Get paginated value lengths with metadata for lazy loading
 *
 * @param {string} tableName - The table identifier
 * @param {string} columnName - The column identifier
 * @param {number} limit - Number of results per page
 * @param {number} offset - Number of results to skip
 * @returns {Promise<Object>} Object with data, hasMore, and total count
 */
export async function getPaginatedValueLengths(
  tableName,
  columnName,
  limit = 100,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total count of unique lengths
    const totalQuery = `
      SELECT COUNT(DISTINCT LENGTH(CAST("${columnName}" AS VARCHAR))) as total
      FROM "${tableName}"
      WHERE "${columnName}" IS NOT NULL
    `;
    const totalResult = await conn.query(totalQuery);
    const total = Number(totalResult.toArray()[0].total);

    // Get paginated data
    const data = await getValueLengths(tableName, columnName, limit, offset);

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
      `Failed to get paginated value lengths for column ${columnName}: ${error.message}`
    );
  } finally {
    await conn.close();
  }
}
