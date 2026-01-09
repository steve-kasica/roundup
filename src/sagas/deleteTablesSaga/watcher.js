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
import { put, select, takeEvery } from "redux-saga/effects";
import { deleteTablesRequest } from "./actions";
import { updateTablesSuccess } from "../updateTablesSaga";
import deleteTablesWorker from "./worker";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";
import { selectAllTableIdsByParentId } from "../../slices/tablesSlice";

export default function* deleteTablesSagaWatcher() {
  yield takeEvery(deleteTablesRequest.type, deleteTablesWorker);

  // If a table has had all its columns deleted, then delete the table
  // itself from the database and state.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const { changedPropertiesById } = action.payload;
    const tableIdsToDelete = Object.entries(changedPropertiesById)
      .filter(
        ([, changedProperties]) =>
          changedProperties.columnIds &&
          changedProperties.columnIds.length === 0
      )
      .map(([tableId]) => tableId);
    if (tableIdsToDelete.length > 0) {
      yield put(deleteTablesRequest({ tableIds: tableIdsToDelete }));
    }
  });

  // If an operation is successfully deleted, Roundup also deletes any
  // associated tables.
  yield takeEvery(deleteOperationsSuccess.type, function* (action) {
    const { operationIds } = action.payload;
    const childTablesToDelete = yield select((state) =>
      selectAllTableIdsByParentId(state, operationIds).flat()
    );
    if (childTablesToDelete.length > 0) {
      yield put(deleteTablesRequest({ tableIds: childTablesToDelete }));
    }
  });
}
