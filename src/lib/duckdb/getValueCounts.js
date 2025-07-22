// import duckdb from "@duckdb/duckdb-wasm";

// /**
//  * Get unique values for a specific column from an OpenRefine table via DuckDB.
//  *
//  * @param {} db
//  * @param {*} tableName
//  * @param {*} columnName
//  */
// async function getValueCounts(db, tableId, columnId) {
//   const conn = await db.connect();
//   const result = await conn.query(
//     `SELECT ${columnId}, count(*) AS count FROM ${tableId} GROUP BY ${columnId}`
//   );

//   await conn.close();

//   return result.toArray().map((row) => Object.values(row));
// }
