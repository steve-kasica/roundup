import { getDuckDB } from "./duckdbClient";

// This function retrieves the number of rows and columns in a specified
// DuckDB table or view.
export async function getTableDimensions(tableName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT 
    (SELECT COUNT(*) FROM ${tableName}) AS rowCount,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '${tableName}') AS columnCount;
    `;
  const result = await conn.query(query);
  await conn.close();
  return result.toArray();
}
