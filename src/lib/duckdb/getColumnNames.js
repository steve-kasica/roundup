import { getDuckDB } from "./duckdbClient";

export async function getColumnNames(tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `SELECT column_name 
        FROM information_schema.columns
        WHERE table_name = '${tableId}'
        ORDER BY ordinal_position ASC;
    `
  );

  await conn.close();
  return result.toArray().map((row) => Object.values(row)[0]);
}
