import duckdb from "@duckdb/duckdb-wasm";

/**
 * Get unique values for a specific column from an OpenRefine table via DuckDB.
 *
 * @param {} db
 * @param {*} tableName
 * @param {*} columnName
 */
async function getColumnUniqueValues(db, tableId, columnName) {
  const conn = await db.connect();
  const result = await conn.query(
    `select distinct ${columnName} from ${tableId}`
  );

  await conn.close();
}
