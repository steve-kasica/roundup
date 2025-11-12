import { getDuckDB } from "./duckdbClient";

/**
 * Fetches rows from multiple tables by stacking them vertically using UNION ALL.
 *
 * This function creates a SQL query that combines rows from multiple tables into a single result set.
 * Each table can contribute different columns at each position, with NULL values used when a column
 * doesn't exist for a particular table at a given position.
 *
 * Edge cases handled:
 * - Single column: Works correctly with one column selected
 * - No columns: Returns empty array if no columns selected (numColumns === 0)
 * - Empty inputs: Returns empty array if tableIds or databaseNameMatrix is empty/null
 * - Connection cleanup: Always closes database connection, even on early returns
 *
 * @param {Array<String>} tableIds - Array of table identifiers to query (e.g., ["t1", "t2", "t3"])
 * @param {Array<Array<String|null>>} databaseNameMatrix - 2D array where each row represents a table's column mapping.
 *   Each column index across all tables should align to the same logical column in the result.
 *   Use null when a table doesn't have a column at that position.
 *   Example:
 *   [
 *     ["columnA", null,       "columnB"],  // Table 1: has columnA at pos 0, nothing at pos 1, columnB at pos 2
 *     ["columnB", "columnC",  null     ],  // Table 2: has columnB at pos 0, columnC at pos 1, nothing at pos 2
 *     ["columnX", "columnY",  "columnZ"]   // Table 3: has all three columns
 *   ]
 * @param {number} [limit=50] - Maximum number of rows to return
 * @param {number} [offset=0] - Number of rows to skip before returning results
 * @param {number|null} [sortBy=null] - Column index (0-based) to sort by, or null for no sorting
 * @param {string} [sortDirection="asc"] - Sort direction: "asc" (ascending) or "desc" (descending)
 *
 * @returns {Promise<Array<Array>>} Array of rows, where each row is an array of column values.
 *   Returns empty array if inputs are invalid or no columns selected.
 *
 * @example
 * // Query two tables with different column structures
 * const rows = await getTableRows(
 *   ["users", "customers"],
 *   [
 *     ["id", "name",  null    ],  // users table: id, name
 *     ["id", null,    "email" ]   // customers table: id, email
 *   ],
 *   100,  // limit
 *   0,    // offset
 *   0,    // sort by first column (id)
 *   "asc" // ascending order
 * );
 *
 * // Generated SQL (simplified):
 * // WITH stacked_data AS (
 * //   SELECT "id" AS col_0, "name" AS col_1, NULL AS col_2 FROM users
 * //   UNION ALL
 * //   SELECT "id" AS col_0, NULL AS col_1, "email" AS col_2 FROM customers
 * // )
 * // SELECT * FROM stacked_data ORDER BY col_0 ASC LIMIT 100 OFFSET 0
 *
 * @example
 * // Single column query (also works correctly)
 * const rows = await getTableRows(
 *   ["table1", "table2"],
 *   [["id"], ["user_id"]],  // Single column from each table
 *   50
 * );
 */
export async function getTableRows(
  tableIds,
  databaseNameMatrix,
  limit = 50,
  offset = 0,
  sortBy = null,
  sortDirection = "asc"
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // Handle edge cases
  if (
    !tableIds ||
    tableIds.length === 0 ||
    !databaseNameMatrix ||
    databaseNameMatrix.length === 0
  ) {
    await conn.close();
    return [];
  }

  // Determine the number of columns in the result (width of the matrix)
  const numColumns = databaseNameMatrix[0]?.length || 0;

  // Handle case where no columns are selected
  if (numColumns === 0) {
    await conn.close();
    return [];
  }

  // Build SELECT statements for each table
  const selectStatements = tableIds.map((tableId, tableIndex) => {
    const databaseNames = databaseNameMatrix[tableIndex];

    // Build the column list for this table's SELECT
    const columns = databaseNames
      .map((colName, colIndex) => {
        if (colName === null) {
          // If column is null, select NULL with an alias
          return `NULL AS col_${colIndex}`;
        } else {
          // Select the actual column with an alias
          return `"${colName}" AS col_${colIndex}`;
        }
      })
      .join(", ");

    return `SELECT ${columns} FROM ${tableId}`;
  });

  // Combine all SELECT statements with UNION ALL
  const unionQuery = selectStatements.join(" UNION ALL ");

  // Build the final query with CTE
  let query = `
    WITH stacked_data AS (
      ${unionQuery}
    )
    SELECT * FROM stacked_data
  `;

  // Add ORDER BY clause if sortBy is provided
  if (sortBy !== null && sortBy >= 0 && sortBy < numColumns) {
    const sortCol = `col_${sortBy}`;
    const direction = sortDirection.toUpperCase() === "DESC" ? "DESC" : "ASC";
    query += ` ORDER BY ${sortCol} ${direction}`;
  }

  // Add LIMIT and OFFSET
  query += ` LIMIT ${limit} OFFSET ${offset}`;

  const result = await conn.query(query);
  await conn.close();
  return result.toArray().map((row) => Object.values(row));
}
