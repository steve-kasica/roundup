import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

export async function dropColumns(tableName, columnNames) {
  columnNames = Array.isArray(columnNames) ? columnNames : [columnNames];
  const db = await getDuckDB();
  const conn = await db.connect();

  // Execute separate ALTER TABLE statements for each column
  const queries = columnNames
    .map(
      (name) => `ALTER TABLE ${tableName} DROP COLUMN ${escapeColumnName(name)}`
    )
    .join("; ");

  const result = await conn.query(queries);
  await conn.close();
  return result;
}
