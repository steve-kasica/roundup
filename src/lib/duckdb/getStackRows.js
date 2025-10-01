import { getDuckDB } from "./duckdbClient";

export async function getStackRows(
  tableIds,
  columnIds, // This should be a matrix where each row corresponds to tableIds by index
  limit = 50,
  offset = 0,
  sortBy = null,
  sortDirection = "asc"
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // Validate inputs
  if (!Array.isArray(tableIds) || tableIds.length === 0) {
    throw new Error("tableIds must be a non-empty array");
  }

  // Build UNION query for multiple tables
  const unionClauses = tableIds.map((tableId, index) => {
    // Get columns for this specific table (matrix row)
    let columnsForTable;
    if (Array.isArray(columnIds) && columnIds.length > 0) {
      if (Array.isArray(columnIds[0])) {
        // columnIds is a matrix - use the row that matches this table index
        columnsForTable = columnIds[index] || columnIds[0]; // fallback to first row if index out of bounds
      } else {
        // columnIds is a simple array - use same columns for all tables
        columnsForTable = columnIds;
      }
    } else {
      // Use all columns
      columnsForTable = ["*"];
    }

    const columnsClause = columnsForTable.join(", ");
    return `SELECT ${columnsClause} FROM ${tableId}`;
  });

  // Combine all SELECT statements with UNION ALL
  const unionQuery = unionClauses.join(" UNION ALL ");

  // Build final query with sorting, limit, and offset
  const query = `
    WITH combined_results AS (
      ${unionQuery}
    )
    SELECT * FROM combined_results
    ${sortBy ? `ORDER BY ${sortBy} ${sortDirection}` : ""}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const result = await conn.query(query);
  await conn.close();
  return result.toArray().map((row) => Object.values(row));
}
