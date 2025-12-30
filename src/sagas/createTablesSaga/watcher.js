/**
 * @fileoverview Create tables saga watcher.
 * @module sagas/createTablesSaga/watcher
 *
 * Watches for table creation requests and triggers the worker saga.
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { takeEvery } from "redux-saga/effects";
import { createTablesRequest } from "./actions";
import addTablesWorker from "./worker";

export default function* createTablesWatcher() {
  yield takeEvery(createTablesRequest.type, addTablesWorker);
}
