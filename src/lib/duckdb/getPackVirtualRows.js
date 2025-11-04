import { getDuckDB } from "./duckdbClient";

/**
 * Fetches joined rows from two tables filtered by a specific match type
 * (one-to-one, one-to-many, many-to-one, many-to-many, one-to-zero, or zero-to-one).
 *
 * This function performs a FULL OUTER JOIN between left and right tables and returns
 * only the rows that match the specified cardinality relationship.
 *
 * @param {string} leftTableId - Identifier for the left table (e.g., "t1")
 * @param {string} rightTableId - Identifier for the right table (e.g., "t2")
 * @param {Array<string>} leftColumnNames - Array of column names to select from left table
 * @param {Array<string>} rightColumnNames - Array of column names to select from right table
 * @param {string} leftKeyColumn - Name of the key column in the left table used for joining
 * @param {string} rightKeyColumn - Name of the key column in the right table used for joining
 * @param {string} joinPredicate - Type of join predicate: "EQUALS", "CONTAINS", "STARTS_WITH", or "ENDS_WITH"
 * @param {string} matchType - The type of match to filter by: "oneToOne", "oneToMany", "manyToOne", "manyToMany", "oneToZero", or "zeroToOne"
 * @param {number} [limit=50] - Maximum number of rows to return
 * @param {number} [offset=0] - Number of rows to skip before returning results
 *
 * @returns {Promise<Array<Array>>} Array of rows matching the specified match type
 *
 * @example
 * const result = await getPackVirtualRows(
 *   "customers",
 *   "orders",
 *   ["customer_id", "name", "email"],
 *   ["order_id", "customer_id", "total"],
 *   "customer_id",
 *   "customer_id",
 *   "EQUALS",
 *   "oneToMany", // Only get rows where one customer has multiple orders
 *   100,
 *   0
 * );
 */
export async function getPackVirtualRows(
  leftTableId,
  rightTableId,
  leftColumnNames,
  rightColumnNames,
  leftKeyColumn,
  rightKeyColumn,
  joinPredicate,
  matchType,
  limit = 50,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // Handle edge cases
  if (
    !leftTableId ||
    !rightTableId ||
    !leftColumnNames ||
    !rightColumnNames ||
    leftColumnNames.length === 0 ||
    rightColumnNames.length === 0 ||
    !matchType
  ) {
    await conn.close();
    return [];
  }

  // Map camelCase matchType to snake_case for SQL
  const matchTypeMap = {
    oneToOne: "one_to_one",
    oneToMany: "one_to_many",
    manyToOne: "many_to_one",
    manyToMany: "many_to_many",
    oneToZero: "one_to_zero",
    zeroToOne: "zero_to_one",
  };

  const sqlMatchType = matchTypeMap[matchType];
  if (!sqlMatchType) {
    await conn.close();
    throw new Error(
      `Invalid match type: ${matchType}. Must be one of: ${Object.keys(
        matchTypeMap
      ).join(", ")}`
    );
  }

  // Build predicate based on join type
  const predicates = {
    EQUALS: `${leftTableId}."${leftKeyColumn}" = ${rightTableId}."${rightKeyColumn}"`,
    CONTAINS: `contains(${leftTableId}."${leftKeyColumn}", ${rightTableId}."${rightKeyColumn}")`,
    STARTS_WITH: `starts_with(${leftTableId}."${leftKeyColumn}", ${rightTableId}."${rightKeyColumn}")`,
    ENDS_WITH: `ends_with(${leftTableId}."${leftKeyColumn}", ${rightTableId}."${rightKeyColumn}")`,
  };

  const predicate = predicates[joinPredicate];
  if (!predicate) {
    await conn.close();
    throw new Error(`Invalid join predicate: ${joinPredicate}`);
  }

  // Build column selections for left table
  const leftColumns = leftColumnNames
    .map((colName) => `${leftTableId}."${colName}"`)
    .join(", ");

  // Build column selections for right table
  const rightColumns = rightColumnNames
    .map((colName) => `${rightTableId}."${colName}"`)
    .join(", ");

  // Main query using FULL OUTER JOIN with window functions to calculate match cardinality
  const query = `
    WITH join_analysis AS (
      SELECT 
        ${leftColumns},
        ${rightColumns},
        ${leftTableId}."${leftKeyColumn}" AS left_key,
        ${rightTableId}."${rightKeyColumn}" AS right_key,
        COUNT(*) OVER (PARTITION BY ${leftTableId}."${leftKeyColumn}") as left_matches,
        COUNT(*) OVER (PARTITION BY ${rightTableId}."${rightKeyColumn}") as right_matches
      FROM ${leftTableId}
      FULL OUTER JOIN ${rightTableId}
      ON ${predicate}
    ),
    categorized AS (
      SELECT 
        *,
        CASE 
          WHEN left_key IS NOT NULL AND right_key IS NOT NULL 
               AND left_matches = 1 AND right_matches = 1 THEN 'one_to_one'
          WHEN left_key IS NOT NULL AND right_key IS NOT NULL 
               AND left_matches = 1 AND right_matches > 1 THEN 'one_to_many'
          WHEN left_key IS NOT NULL AND right_key IS NOT NULL 
               AND left_matches > 1 AND right_matches = 1 THEN 'many_to_one'
          WHEN left_key IS NOT NULL AND right_key IS NOT NULL 
               AND left_matches > 1 AND right_matches > 1 THEN 'many_to_many'
          WHEN left_key IS NOT NULL AND right_key IS NULL THEN 'one_to_zero'
          WHEN left_key IS NULL AND right_key IS NOT NULL THEN 'zero_to_one'
        END AS match_type
      FROM join_analysis
    )
    SELECT * FROM categorized
    WHERE match_type = '${sqlMatchType}'
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result = await conn.query(query);
  await conn.close();

  const rows = result.toArray().map((row) => {
    const rowObj = typeof row.toJSON === "function" ? row.toJSON() : row;
    // Extract only the data columns, excluding metadata
    const dataColumns = leftColumnNames.concat(rightColumnNames);
    return dataColumns.map((col) => rowObj[col]);
  });

  return rows;
}
