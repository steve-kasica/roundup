import { getDuckDB } from "./duckdbClient";

export async function createTables(tableName, fileName) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const results = [];

  // Create the table
  await conn.query(
    `CREATE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${fileName}', AUTO_DETECT=TRUE);`
  );

  await conn.close();
  return results;
}
