import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

export async function setColumnType(tableId, columnName, newType) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `ALTER TABLE "${tableId}" ALTER COLUMN ${escapeColumnName(
    columnName
  )} SET DATA TYPE ${newType}`;
  const result = await conn.query(query);
  await conn.close();
  return result.toArray();
}
