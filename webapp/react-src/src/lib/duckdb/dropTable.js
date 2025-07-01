import { getDuckDB } from "./duckdbClient";

export async function dropTable(tableName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `DROP TABLE ${tableName}` // Use backticks for template literals
  );
  await conn.close();
  return result;
}
