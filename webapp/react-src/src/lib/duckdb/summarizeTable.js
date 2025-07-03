import { getDuckDB } from "./duckdbClient";

export async function summarizeTable(tableName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const response = await conn.query(`SUMMARIZE ${tableName}`);
  await conn.close();
  const result = response.toArray().map((proxyStruct) => proxyStruct.toJSON());
  return result;
}
