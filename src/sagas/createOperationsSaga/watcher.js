import { takeEvery } from "redux-saga/effects";
import { createOperationsRequest } from "./actions";
import createOperationsWorker from "./worker";

/**
 * Main watcher saga for database view creation.
 *
 * Listens for:
 * 1. Manual createOperations actions - Explicitly requested view creation
 * 2. addOperation actions - Automatically creates views when new operations are added
 *
 * This ensures that database views are always created or updated when operations
 * are added to the application state, keeping the database synchronized.
 *
 * @generator
 * @yields {Effect} Saga effects for watching actions and triggering worker saga
 */
export default function* createOperationsWatcher() {
  // Listen for manual view creation requests
  yield takeEvery(createOperationsRequest.type, createOperationsWorker);
}
