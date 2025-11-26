import { getDuckDB } from "./duckdbClient";

export async function dropColumns(tableName, columnNames) {
  columnNames = Array.isArray(columnNames) ? columnNames : [columnNames];
  const db = await getDuckDB();
  const conn = await db.connect();
  const result = await conn.query(
    `ALTER TABLE ${tableName} ${columnNames
      .map((name) => `DROP COLUMN ${name}`)
      .join(", ")}`
  );
  await conn.close();
  return result;
}
