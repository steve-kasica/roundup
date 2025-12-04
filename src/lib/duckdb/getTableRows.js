import { getDuckDB } from "./duckdbClient";

function parseValue(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    // Handle nested objects (like STRUCT types)
    return JSON.stringify(value);
  }
  return value;
}

/**
 * Retrieves rows from a specified DuckDB table with optional column selection, sorting, and pagination.
 *
 * @async
 * @function getTableRows
 * @param {string} tableName - The name of the table to query.
 * @param {string[]} columnsList - Array of column names to select. If null or empty, selects all columns.
 * @param {number} [limit=50] - Maximum number of rows to retrieve.
 * @param {number} [offset=0] - Number of rows to skip before starting to return rows.
 * @param {string|null} [sortBy=null] - Column name to sort by. If null, no sorting is applied.
 * @param {string} [sortDirection="asc"] - Sort direction, either "asc" or "desc".
 * @returns {Promise<Array<Array<unknown>>>} A promise that resolves to an array of rows, each row as an array of parsed values.
 */
export async function getTableRows(
  tableName,
  columnsList,
  limit = 50,
  offset = 0,
  sortBy = null,
  sortDirection = "asc"
) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const columnsClause =
    columnsList !== null && columnsList.length > 0
      ? columnsList.join(", ")
      : "*";
  const query = `
    SELECT ${columnsClause} 
    FROM ${tableName} 
    ${sortBy ? `ORDER BY ${sortBy} ${sortDirection}` : ""}
    LIMIT ${limit} 
    OFFSET ${offset}
  `;
  const result = await conn.query(query);
  await conn.close();

  return result.toArray().map((row) => Object.values(row).map(parseValue));
}
