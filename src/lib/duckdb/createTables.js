import { getDuckDB } from "./duckdbClient";

export async function createTables(tables) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = [];
  tables.forEach(async (table) => {
    query.push(
      `CREATE TABLE "${table.id}" AS SELECT * FROM read_csv_auto('${table.fileName}', AUTO_DETECT=TRUE, all_varchar=true);`
    );
  });
  // Ingest the tables/files into a DuckDB table
  const result = await conn.query(query.join("\n"));
  await conn.close();
  return result;
}
