import { getDuckDB } from "./duckdbClient";

// This function retrieves the number of rows and columns in a specified
// DuckDB table (for table objects) or view (for operations).
export async function getTableDimensions(tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT 
    (SELECT COUNT(*) FROM ${tableId}) AS rowCount,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '${tableId}') AS columnCount;
    `;
  const response = await conn.query(query);
  await conn.close();
  const { rowCount, columnCount } = response
    .toArray()
    .map((proxyStruct) => proxyStruct.toJSON())[0];

  // Convert rowCount and columnCount to numbers
  return { rowCount: Number(rowCount), columnCount: Number(columnCount) };
}
