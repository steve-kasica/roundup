/**
 * deleteTablesSaga/worker.js
 *
 * Worker saga to handle deleting tables and its columns from the database and state.
 *  One quirky aspect of Roundup's architectural integration with DuckDB is that
 *  because DuckDB won't let you delete all the columns from a table via the ALTER
 *  TABLE statement, we can't use the deleteColumnsSaga to delete the columns that
 *  belong to tables slated for deletion.
 */

import { call, put, select } from "redux-saga/effects";
import {
  deleteTables as deleteTablesInSlice,
  selectTablesById,
} from "../../slices/tablesSlice";
import { dropTable } from "../../lib/duckdb";
import { deleteTablesFailure, deleteTablesSuccess } from "./actions";
import { removeFromSelectedTableIds } from "../../slices/uiSlice";

export default function* deleteTablesWorker(action) {
  const successfulDeletions = [];
  const failedDeletions = [];
  let { tableIds } = action.payload;
  if (!Array.isArray(tableIds)) {
    tableIds = [tableIds];
  }

  const tables = yield select((state) => selectTablesById(state, tableIds));

  for (const table of tables) {
    try {
      // Remove table (and columns) from DuckDB
      yield call(dropTable, table.databaseName);

      // Remove table from state
      yield put(deleteTablesInSlice(table.id));

      // Remove table from selectedTableIds in UI state
      yield put(removeFromSelectedTableIds(table.id));

      successfulDeletions.push(table);
    } catch (error) {
      alert(`Error deleting table ${table?.name}: ${error.message}`);
      console.error("deleteTablesSaga/worker.js: Failed to drop table", {
        table,
        error,
      });
      failedDeletions.push(table);
    }
  }

  if (failedDeletions.length > 0) {
    yield put(
      deleteTablesFailure({
        tableIds: failedDeletions.map((t) => t.id),
        error: "One or more tables failed to delete.",
      }),
    );
  }

  if (successfulDeletions.length > 0) {
    yield put(
      deleteTablesSuccess({
        tableIds: successfulDeletions.map((t) => t.id),
      }),
    );
  }
}
