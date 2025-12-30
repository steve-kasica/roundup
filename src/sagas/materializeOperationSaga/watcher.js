/**
 * @fileoverview Materialize operation saga watcher.
 * @module sagas/materializeOperationSaga/watcher
 *
 * Watches for operation materialization requests and triggers the worker.
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { takeEvery } from "redux-saga/effects";
import { materializeOperationRequest } from "./actions";
import materializeOperationWorker from "./worker";

export default function* materializeOperationSagaWatcher() {
  yield takeEvery(materializeOperationRequest.type, materializeOperationWorker);
}
