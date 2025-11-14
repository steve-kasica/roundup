import { getDuckDB } from "./duckdbClient";

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
  let query = `ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${columnType}`;

  // Set default value if provided
  if (defaultValue !== null) {
    const valueStr =
      typeof defaultValue === "string" ? `'${defaultValue}'` : defaultValue;
    query += ` DEFAULT ${valueStr}`;
  }

  await conn.query(query);

  // If insertionIndex is specified, we need to reorder the columns
  // if (insertionIndex !== null) {
  //   // Get current column names
  //   const columnsResult = await conn.query(`DESCRIBE "${tableName}"`);
  //   const columns = columnsResult.toArray().map((row) => row.column_name);

  //   // Remove the newly added column from the end
  //   const newColumn = columns.pop();

  //   // Insert it at the specified index
  //   columns.splice(insertionIndex, 0, newColumn);

  //   // Create a new table with the reordered columns
  //   const tempTableId = `${tableName}_temp_${Date.now()}`;
  //   const columnsClause = columns.map((col) => `"${col}"`).join(", ");

  //   await conn.query(
  //     `CREATE TABLE "${tempTableId}" AS SELECT ${columnsClause} FROM "${tableName}"`
  //   );
  //   await conn.query(`DROP TABLE "${tableName}"`);
  //   await conn.query(`ALTER TABLE "${tempTableId}" RENAME TO "${tableName}"`);
  // }

  await conn.close();
  return { success: true, columnName, columnType };
}
