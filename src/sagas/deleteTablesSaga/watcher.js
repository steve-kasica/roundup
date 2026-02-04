/**
 * @fileoverview Delete tables saga watcher.
 * @module sagas/deleteTablesSaga/watcher
 *
 * Watches for table deletion requests and triggers the worker saga.
 * Auto-deletes tables that lose all their columns.
 *
 * TODO: should deleting an operation also trigger deleting its tables,
 * since it triggers deleting its children if the child is an operation.
 *
 * Features:
 * - Handles deleteTablesRequest actions
 * - Auto-deletes tables with empty columnIds after updates
 * - Coordinates with updateTablesSuccess
 */
import { call, select, takeEvery } from "redux-saga/effects";
import { deleteTablesRequest } from "./actions";
import { updateTablesSuccess } from "../updateTablesSaga";
import deleteTablesWorker from "./worker";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";

export default function* deleteTablesSagaWatcher() {
  yield takeEvery(deleteTablesRequest.type, function* (action) {
    const tableIds = action.payload;
    const tables = yield select((state) => selectTablesById(state, tableIds));
    yield call(deleteTablesWorker, tables);
  });

  // If a table has had all its columns deleted, then delete the table
  // itself from the database and state.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const tableUpdates = action.payload;
    const tablesToDelete = [];
    for (const tableUpdate of tableUpdates) {
      const { id } = tableUpdate;
      const changedAttributes = Object.keys(tableUpdate).filter(
        (key) => key !== "id",
      );
      if (changedAttributes.includes("columnIds")) {
        const table = yield select((state) => selectTablesById(state, id));
        if (table.columnIds.length === 0) {
          tablesToDelete.push(table);
        }
      }
    }
    if (tablesToDelete.length > 0) {
      yield call(deleteTablesWorker, tablesToDelete);
    }
  });

  // If an operation is successfully deleted, Roundup also deletes any
  // associated tables.
  yield takeEvery(deleteOperationsSuccess.type, function* (action) {
    const deletedOperations = action.payload;
    const tableIdsToDelete = deletedOperations
      .map(({ childIds }) => childIds)
      .flat()
      .filter(isTableId);

    if (tableIdsToDelete.length > 0) {
      const tablesToDelete = yield select((state) =>
        selectTablesById(state, tableIdsToDelete),
      );
      yield call(deleteTablesWorker, tablesToDelete);
    }
  });
}
