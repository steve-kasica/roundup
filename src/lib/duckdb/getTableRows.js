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

export async function getTableRows(
  tableId,
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
    FROM ${tableId} 
    ${sortBy ? `ORDER BY ${sortBy} ${sortDirection}` : ""}
    LIMIT ${limit} 
    OFFSET ${offset}
  `;
  const result = await conn.query(query);
  await conn.close();

  return result.toArray().map((row) => Object.values(row).map(parseValue));
}
