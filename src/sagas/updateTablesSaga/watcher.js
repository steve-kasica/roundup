/**
 * @fileoverview Update tables saga watcher.
 * @module sagas/updateTablesSaga/watcher
 *
 * Watches for table update requests and triggers the worker saga.
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { takeEvery } from "redux-saga/effects";
import { updateTablesRequest } from "./actions";
import updateTablesWorker from "./worker";

/**
 * Saga watcher that listens for the `updateTablesRequest` action and triggers the corresponding worker saga.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `updateTablesSagaWorker` whenever the `updateTablesRequest` action is dispatched.
 */
export default function* updateTablesSagaWatcher() {
  yield takeEvery(updateTablesRequest.type, updateTablesWorker);
}
