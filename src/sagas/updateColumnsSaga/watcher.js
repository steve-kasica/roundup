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
}
