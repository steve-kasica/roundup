import { getDuckDB } from "./duckdbClient";

// TODO: replace with table.id
export async function dropTable(tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `DROP TABLE ${tableId}` // Use backticks for template literals
  );
  await conn.close();
  return result;
}
