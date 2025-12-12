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
    return JSON.stringify(value);
  }
  return value;
}

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

  // Avoid Object.values on DuckDB row proxies (fails with duplicate column names)
  let rows;
  if (typeof result.toRows === "function") {
    rows = result.toRows().map((r) => r.map(parseValue));
  } else {
    // Fallback: use explicit column names to read values
    const columnNames =
      (columnsList && columnsList.length
        ? columnsList
        : result.schema?.fields?.map((f) => f.name)) || [];
    const objects = result.toArray();
    rows = objects.map((obj) =>
      columnNames.map((name) => parseValue(obj[name]))
    );
  }

  await conn.close();
  return rows;
}
