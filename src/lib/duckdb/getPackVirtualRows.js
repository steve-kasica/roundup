import { getDuckDB } from "./duckdbClient";

/**
 * Fetches joined rows from two tables filtered by specific match types
 * (matches, left_unmatched, or right_unmatched).
 *
 * This function performs a FULL OUTER JOIN between left and right tables and returns
 * only the rows that match the specified match types.
 *
 * @param {string} leftTableId - Identifier for the left table (e.g., "t1")
 * @param {string} rightTableId - Identifier for the right table (e.g., "t2")
 * @param {Array<string>} leftColumnNames - Array of column names to select from left table
 * @param {Array<string>} rightColumnNames - Array of column names to select from right table
 * @param {string} leftKeyColumn - Name of the key column in the left table used for joining
 * @param {string} rightKeyColumn - Name of the key column in the right table used for joining
 * @param {string} joinPredicate - Type of join predicate: "EQUALS", "CONTAINS", "STARTS_WITH", or "ENDS_WITH"
 * @param {Array<string>} matchTypes - Array of match types to filter by: "matches", "left_unmatched", and/or "right_unmatched"
 * @param {number} [limit=50] - Maximum number of rows to return
 * @param {number} [offset=0] - Number of rows to skip before returning results
 *
 * @returns {Promise<Array<Array>>} Array of rows matching the specified match types
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
 *   ["matches", "left_unmatched"], // Get matched rows and left-only rows
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
  matchTypes,
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
    !Array.isArray(leftColumnNames) ||
    !Array.isArray(rightColumnNames) ||
    !matchTypes ||
    !Array.isArray(matchTypes) ||
    matchTypes.length === 0
  ) {
    await conn.close();
    return [];
  }

  // Validate match types
  const validMatchTypes = ["matches", "left_unmatched", "right_unmatched"];
  const invalidTypes = matchTypes.filter(
    (type) => !validMatchTypes.includes(type)
  );

  if (invalidTypes.length > 0) {
    await conn.close();
    throw new Error(
      `Invalid match type(s): ${invalidTypes.join(
        ", "
      )}. Must be one of: ${validMatchTypes.join(", ")}`
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
  const leftColumns =
    leftColumnNames.length > 0
      ? leftColumnNames
          .map((colName) => `${leftTableId}."${colName}"`)
          .join(", ")
      : "NULL as __left_placeholder__";

  // Build column selections for right table
  const rightColumns =
    rightColumnNames.length > 0
      ? rightColumnNames
          .map((colName) => `${rightTableId}."${colName}"`)
          .join(", ")
      : "NULL as __right_placeholder__";

  // Build IN clause for match type filter
  const matchTypeFilter = matchTypes.map((type) => `'${type}'`).join(", ");

  // Simplified query using FULL OUTER JOIN to categorize rows
  const query = `
    WITH join_analysis AS (
      SELECT 
        ${leftColumns},
        ${rightColumns},
        ${leftTableId}."${leftKeyColumn}" AS left_key,
        ${rightTableId}."${rightKeyColumn}" AS right_key
      FROM ${leftTableId}
      FULL OUTER JOIN ${rightTableId}
      ON ${predicate}
    ),
    categorized AS (
      SELECT 
        *,
        CASE 
          WHEN left_key IS NOT NULL AND right_key IS NOT NULL THEN 'matches'
          WHEN left_key IS NOT NULL AND right_key IS NULL THEN 'left_unmatched'
          WHEN left_key IS NULL AND right_key IS NOT NULL THEN 'right_unmatched'
        END AS match_type
      FROM join_analysis
    )
    SELECT * FROM categorized
    WHERE match_type IN (${matchTypeFilter})
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result = await conn.query(query);
  await conn.close();

  const rows = result.toArray().map((row) => {
    const rowObj = typeof row.toJSON === "function" ? row.toJSON() : row;
    // Extract only the data columns, excluding metadata and placeholders
    const dataColumns = leftColumnNames.concat(rightColumnNames);

    // If no columns were requested from either table, return empty array for that side
    if (dataColumns.length === 0) {
      return [];
    }

    return dataColumns.map((col) => rowObj[col]);
  });

  return rows;
}
