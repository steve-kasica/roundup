import { getDuckDB } from "./duckdbClient";

// Helper function to convert BigInt values to Numbers
function convertBigIntsToNumbers(obj) {
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    converted[key] = typeof value === "bigint" ? Number(value) : value;
  }
  return converted;
}
// TODO: is this being used anymore?
export async function rankColumnsKeyness(databaseNames, tableId) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const columnChecks = databaseNames
    .map(
      (columnId) =>
        `SELECT 
        '${columnId}' as id,
        COUNT(*) as totalRows,
        COUNT(DISTINCT ${columnId}) as uniqueValues,
        COUNT(${columnId}) as nonNullValues
      FROM ${tableId}`
    )
    .join("\nUNION ALL\n");

  const query = `
    WITH column_stats AS (
      ${columnChecks}
    )
    SELECT *
    FROM column_stats
    ORDER BY uniqueValues DESC;
  `;

  const result = await conn.query(query);
  await conn.close();

  return result.toArray().map((proxyStructRow) => {
    const plainObject = { ...proxyStructRow };
    return convertBigIntsToNumbers(plainObject);
  });
}
