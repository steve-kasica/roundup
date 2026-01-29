/**
 * @fileoverview Create operations saga watcher.
 * @module sagas/createOperationsSaga/watcher
 *
 * Watches for operation creation requests and triggers the worker saga.
 * Ensures database views are created when operations are added.
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { call, takeEvery } from "redux-saga/effects";
import { createOperationsRequest } from "./actions";
import createOperationsWorker from "./worker";

/**
 * Main watcher saga for database view creation.
 *
 * Listens for:
 * 1. Manual createOperations actions - Explicitly requested view creation
 * 2. addOperations actions - Automatically creates views when new operations are added
 *
 * This ensures that database views are always created or updated when operations
 * are added to the application state, keeping the database synchronized.
 *
 * @generator
 * @yields {Effect} Saga effects for watching actions and triggering worker saga
 */
export default function* createOperationsWatcher() {
  // Listen for manual view creation requests
  yield takeEvery(createOperationsRequest.type, function* (action) {
    const operationData = action.payload;
    yield call(createOperationsWorker, operationData);
  });
}
