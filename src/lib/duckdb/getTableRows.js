import { getDuckDB } from "./duckdbClient";

export async function getTableRows(
  tableId,
  columnsList,
  limit = 50,
  offset = 0
) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const columnsClause = columnsList ? columnsList.join(", ") : "*";
  const result = await conn.query(
    `SELECT ${columnsClause} FROM "${tableId}" LIMIT ${limit} OFFSET ${offset}`
  );
  await conn.close();
  return result.toArray().map((row) => Object.values(row));
}
