import { getDuckDB } from "./duckdbClient";

export async function summarizeTable(tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const response = await conn.query(`SUMMARIZE ${tableId}`);
  await conn.close();
  const result = response.toArray().map((proxyStruct) => proxyStruct.toJSON());
  return result;
}
