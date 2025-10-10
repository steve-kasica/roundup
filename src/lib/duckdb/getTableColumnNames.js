import { getDuckDB } from "./duckdbClient";

/**
 * Get the column names of a DuckDB table in order
 * @param {string} tableName - The name of the table
 * @returns {Promise<string[]>} Array of column names in order
 *
 * Remember that ordinal_position is 1-indexed
 */
export async function getTableColumnNames(tableId, ordinal_position = 0) {
  const db = await getDuckDB();
  const conn = await db.connect();
  let query = `
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = '${tableId}'
      ${
        ordinal_position > 0 ? `AND ordinal_position = ${ordinal_position}` : ""
      }
      ORDER BY ordinal_position
    `;

  const response = await conn.query(query);
  await conn.close();
  return response
    .toArray()
    .map((proxyStruct) => proxyStruct.toJSON()["column_name"]);
}
