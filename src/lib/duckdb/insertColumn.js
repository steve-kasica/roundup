import { getDuckDB } from "./duckdbClient";

export async function insertColumn(
  tableId,
  databaseName,
  insertionIndex = null,
  columnType = "TEXT",
  defaultValue = null
) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // First, add the column to the table
  let query = `ALTER TABLE "${tableId}" ADD COLUMN "${databaseName}" ${columnType}`;

  // Set default value if provided
  if (defaultValue !== null) {
    const valueStr =
      typeof defaultValue === "string" ? `'${defaultValue}'` : defaultValue;
    query += ` DEFAULT ${valueStr}`;
  }

  await conn.query(query);

  // If insertionIndex is specified, we need to reorder the columns
  if (insertionIndex !== null) {
    // Get current column names
    const columnsResult = await conn.query(`DESCRIBE "${tableId}"`);
    const columns = columnsResult.toArray().map((row) => row.column_name);

    // Remove the newly added column from the end
    const newColumn = columns.pop();

    // Insert it at the specified index
    columns.splice(insertionIndex, 0, newColumn);

    // Create a new table with the reordered columns
    const tempTableId = `${tableId}_temp_${Date.now()}`;
    const columnsClause = columns.map((col) => `"${col}"`).join(", ");

    await conn.query(
      `CREATE TABLE "${tempTableId}" AS SELECT ${columnsClause} FROM "${tableId}"`
    );
    await conn.query(`DROP TABLE "${tableId}"`);
    await conn.query(`ALTER TABLE "${tempTableId}" RENAME TO "${tableId}"`);
  }

  await conn.close();
  return { success: true, databaseName, columnType };
}
