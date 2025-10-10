import { getDuckDB } from "./duckdbClient";

export async function createTables(tables) {
  tables = Array.isArray(tables) ? tables : [tables]; // Normalize input to an array
  const db = await getDuckDB();
  const conn = await db.connect();
  const results = [];

  for (const table of tables) {
    // Create the table
    await conn.query(
      `CREATE TABLE "${table.id}" AS SELECT * FROM read_csv_auto('${table.fileName}', AUTO_DETECT=TRUE, all_varchar=true);`
    );

    // Get table metadata in the same connection
    const metadata = await conn.query(`
      SELECT 
        COUNT(*) as row_count,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '${table.id}') as column_count
      FROM "${table.id}";
    `);

    results.push({
      tableId: table.id,
      fileName: table.fileName,
      rowCount: Number(metadata.toArray()[0].row_count),
      columnCount: Number(metadata.toArray()[0].column_count),
    });
  }

  await conn.close();
  return results;
}
