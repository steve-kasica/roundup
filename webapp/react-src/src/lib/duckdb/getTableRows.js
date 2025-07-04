import { getDuckDB } from "./duckdbClient";

export async function getTableRows(tableId, limit = 50, offset = 0) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `SELECT * FROM "${tableId}" LIMIT ${limit} OFFSET ${offset}`
  );
  await conn.close();
  return result.toArray().map((row) => Object.values(row));
}
