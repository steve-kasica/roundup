/**
 * @fileoverview Update columns saga watcher.
 * @module sagas/updateColumnsSaga/watcher
 *
 * Watches for column update requests and triggers the worker saga.
 * Auto-fetches column statistics when new columns are created.
 *
 * Features:
 * - Handles updateColumnsRequest actions
 * - Auto-updates column stats after createColumnsSuccess
 * - Fetches summary attributes and top values
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { call, takeEvery } from "redux-saga/effects";
import { updateColumnsRequest } from "./actions";
import updateColumnsWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { updateTablesSuccess } from "../updateTablesSaga";

// Watcher saga
// payload is expected to be an array called `columnUpdates`
export default function* updateColumnsSaga() {
  yield takeEvery(updateColumnsRequest.type, function* (action) {
    const columnUpdates = action.payload;
    yield call(updateColumnsWorker, columnUpdates);
  });

  // When columns are created, need to fetch additional attributes for those columns from the database
  yield takeEvery(createColumnsSuccess.type, function* (action) {
    const columnsToUpdate = action.payload;
    yield call(updateColumnsWorker, columnsToUpdate);
  });

  // when a table is updated, we may need to update its columns
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const updatedTables = action.payload;
    const columnsToUpdate = [];
    for (const table of updatedTables) {
      if (table.columnIds) {
        // If a table's columnIds were updated, we need to re-index all of its columns to update their index property. This is because the columnIds array order determines the column order in the UI, and the index property of each column must match its position in the columnIds array.
        for (let i = 0; i < table.columnIds.length; i++) {
          const columnId = table.columnIds[i];
          columnsToUpdate.push({ id: columnId, index: i });
        }
      }
    }
    if (columnsToUpdate.length > 0) {
      yield call(updateColumnsWorker, columnsToUpdate);
    }
  });
}
