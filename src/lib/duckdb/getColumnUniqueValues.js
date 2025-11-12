import duckdb from "@duckdb/duckdb-wasm";

/**
 * Get unique values for a specific column from an OpenRefine table via DuckDB.
 *
 * @param {} db
 * @param {*} tableName
 * @param {*} databaseName
 */
async function getColumnUniqueValues(db, tableId, databaseName) {
  const conn = await db.connect();
  const result = await conn.query(
    `select distinct ${databaseName} from ${tableId}`
  );

  await conn.close();
}
