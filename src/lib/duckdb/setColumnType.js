import { getDuckDB } from "./duckdbClient";

export async function setColumnType(tableId, columnName, newType) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `ALTER TABLE "${tableId}" ALTER COLUMN "${columnName}" SET DATA TYPE ${newType}`;
  const result = await conn.query(query);
  await conn.close();
  return result.toArray();
}
