/**
 * deleteTablesSaga/worker.js
 *
 * Worker saga to handle deleting tables and its columns from the database and state.
 *  One quirky aspect of Roundup's architectural integration with DuckDB is that
 *  because DuckDB won't let you delete all the columns from a table via the ALTER
 *  TABLE statement, we can't use the deleteColumnsSaga to delete the columns that
 *  belong to tables slated for deletion.
 */

import { call, put } from "redux-saga/effects";
import { deleteTables as deleteTablesInSlice } from "../../slices/tablesSlice";
import { dropTable } from "../../lib/duckdb";
import { deleteTablesSuccess } from "./actions";

export default function* deleteTablesWorker(tables) {
  let isFailure = false;

  for (const table of tables) {
    try {
      // Remove table (and columns) from DuckDB
      yield call(dropTable, table.databaseName);
    } catch (error) {
      alert(`Error deleting table ${table?.name}: ${error.message}`);
      console.error("deleteTablesSaga/worker.js: Failed to drop table", {
        table,
        error,
      });
      isFailure = true;
    }
  }

  if (!isFailure) {
    // Remove table from state
    yield put(deleteTablesInSlice(tables.map((table) => table.id)));
    yield put(deleteTablesSuccess(tables));
  }
}
