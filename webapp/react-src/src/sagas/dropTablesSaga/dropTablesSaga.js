import { put, select, takeEvery } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import {
  addTablesToLoading,
  dropTables,
  selectTablesById,
} from "../../slices/tablesSlice";
import { dropColumns } from "../../slices/columnsSlice";
import { dropTable } from "../../lib/duckdb";
import { removeChildFromOperation } from "../../slices/operationsSlice";

/**
 * Action creator for removing tables.
 *
 * This action is dispatched to trigger the removal of tables from the state.
 * The payload should contain the table ID(s) to remove.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/deleteTables" and payload.
 */
export const dropTablesAction = createAction("sagas/dropTables");

export default function* dropTablesSagaWatcher() {
  yield takeEvery(dropTablesAction.type, dropTablesSagaWorker);
}

export function* dropTablesSagaWorker(action) {
  let tableIds = action.payload;
  if (!Array.isArray(tableIds)) {
    tableIds = [tableIds];
  }

  // Add to loading state
  yield put(addTablesToLoading(tableIds));

  const tables = yield select((state) =>
    tableIds.map((id) => selectTablesById(state, id))
  );

  // Remove from operations tree (if present)
  for (const table of tables) {
    if (table.operationId) {
      yield put(
        removeChildFromOperation({
          operationId: table.operationId,
          childId: table.id,
        })
      );
    }

    // Remove all columns belonging to this table
    yield put(dropColumns(table.columnIds));

    // Remove table from DuckDB
    dropTable(table.id);
  }

  // Remove from tables state
  // Also removes tables from loading state
  yield put(dropTables(tableIds));
}
