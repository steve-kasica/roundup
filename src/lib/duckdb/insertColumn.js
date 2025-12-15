import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

export async function insertColumn(
  tableName,
  columnName,
  insertionIndex = null,
  columnType = "TEXT",
  defaultValue = null
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // First, add the column to the table
  let query = `ALTER TABLE "${tableName}" ADD COLUMN ${escapeColumnName(
    columnName
  )} ${columnType}`;

  // Set default value if provided
  if (defaultValue !== null) {
    const valueStr =
      typeof defaultValue === "string" ? `'${defaultValue}'` : defaultValue;
    query += ` DEFAULT ${valueStr}`;
  }

  await conn.query(query);

  await conn.close();
  return { success: true, columnName, columnType };
}
