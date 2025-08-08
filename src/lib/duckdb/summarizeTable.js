import { getDuckDB } from "./duckdbClient";

export async function summarizeTable(tableId, columnList) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const columnsClause = columnList ? columnList.join(", ") : "*";
  // If columnList is provided, use it in the query; otherwise, select all columns
  // This allows for summarizing specific columns or the entire table
  const query = `SUMMARIZE SELECT ${columnsClause} FROM ${tableId};`;
  const response = await conn.query(query);
  await conn.close();
  const result = response.toArray().map((proxyStruct) => proxyStruct.toJSON());
  return result;
}
