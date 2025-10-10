import { getDuckDB } from "./duckdbClient";

export async function dropView(operationId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `DROP VIEW ${operationId}` // Use backticks for template literals
  );
  await conn.close();
  return result;
}
