import { getDuckDB } from "./duckdbClient";

// TODO: replace with table.id
export async function dropTable(tableName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(`DROP TABLE ${tableName}`);
  await conn.close();
  return result;
}
