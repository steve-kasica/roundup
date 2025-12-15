import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

/**
 * Calculate statistics for a pack operation (join) between two tables.
 *
 * Performs a full outer join between two tables and returns counts of:
 * - Matched rows (present in both tables based on join condition)
 * - Left unmatched rows (present only in left table)
 * - Right unmatched rows (present only in right table)
 *
 * @param {string} leftTableName - Name of the left table
 * @param {string} rightTableName - Name of the right table
 * @param {string} leftColumnName - Column name in the left table to join on
 * @param {string} rightColumnName - Column name in the right table to join on
 * @param {string} joinType - Type of join predicate: 'EQUALS', 'CONTAINS', 'STARTS_WITH', or 'ENDS_WITH'
 * @returns {Promise<{matches: number, left_unmatched: number, right_unmatched: number}>}
 *          Object containing match statistics
 */
export async function calcPackStats(
  leftTableName,
  rightTableName,
  leftColumnName,
  rightColumnName,
  joinType
) {
  const leftValue = `CAST(${leftTableName}.${escapeColumnName(
    leftColumnName
  )} AS VARCHAR)`;
  const rightValue = `CAST(${rightTableName}.${escapeColumnName(
    rightColumnName
  )} AS VARCHAR)`;
  const db = await getDuckDB();
  const conn = await db.connect();
  const predicates = {
    EQUALS: `${leftValue} = ${rightValue}`,
    CONTAINS: `contains(${leftValue}, ${rightValue})`,
    STARTS_WITH: `starts_with(${leftValue}, ${rightValue})`,
    ENDS_WITH: `ends_with(${leftValue}, ${rightValue})`,
  };
  const query = `
    -- Count output rows by join relationship type
    WITH join_analysis AS (
        SELECT 
            ${leftValue} AS left_value,
            ${rightValue} AS right_value
        FROM ${leftTableName}
        FULL OUTER JOIN ${rightTableName}
        ON ${predicates[joinType]}
    )
    SELECT 
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NULL THEN 1 END) as left_unmatched,
        COUNT(CASE WHEN left_value IS NOT NULL AND right_value IS NOT NULL THEN 1 END) as matches,        
        COUNT(CASE WHEN left_value IS NULL AND right_value IS NOT NULL THEN 1 END) as right_unmatched
    FROM join_analysis
`;
  const response = await conn.query(query);
  await conn.close();
  const { matches, left_unmatched, right_unmatched } = response
    .toArray()
    .map((proxyStruct) => proxyStruct.toJSON())[0];

  // Convert all counts to numbers
  return {
    matches: Number(matches),
    left_unmatched: Number(left_unmatched),
    right_unmatched: Number(right_unmatched),
  };
}
