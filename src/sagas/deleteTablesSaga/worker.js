import { call, put, select, takeEvery } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import {
  addTablesToLoading,
  dropTables,
  selectTablesById,
} from "../../slices/tablesSlice";
import {
  dropColumns,
  removeColumnsFromLoading,
  selectLoadingColumns,
  setSelectedColumns,
} from "../../slices/columnsSlice";
import { dropTable } from "../../lib/duckdb";
import { removeChildFromOperation } from "../../slices/operationsSlice";
import { deleteTablesFailure, deleteTablesSuccess } from "./actions";

export default function* deleteTablesWorker(action) {
  const successfulDeletions = [];
  const failedDeletions = [];
  let { tableIds } = action.payload;
  if (!Array.isArray(tableIds)) {
    tableIds = [tableIds];
  }

  const tables = yield select((state) => selectTablesById(state, tableIds));

  for (const table of tables) {
    yield put(selectLoadingColumns(table.columnIds));
    try {
      // Remove table from DuckDB
      yield call(dropTable, table.id);

      // Remove table from state
      yield put(dropTables(table.id));

      successfulDeletions.push(table);
    } catch (error) {
      console.error("Error dropping table from DuckDB:", error);
      failedDeletions.push(table);
    } finally {
      yield put(removeColumnsFromLoading(table.columnIds));
    }
    if (failedDeletions.length > 0) {
      yield put(
        deleteTablesFailure({
          tableIds: failedDeletions.map((t) => t.id),
          error: "One or more tables failed to delete.",
        })
      );
    }

    if (successfulDeletions.length > 0) {
      yield put(
        deleteTablesSuccess({
          tableIds: successfulDeletions.map((t) => t.id),
        })
      );
    }
    // if (table.operationId) {
    //   yield put(
    //     removeChildFromOperation({
    //       operationId: table.operationId,
    //       childId: table.id,
    //     })
    //   );
    // }
  }

  // Remove from tables state
  // Also removes tables from loading state
}
