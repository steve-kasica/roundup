import { put, takeEvery, takeLatest } from "redux-saga/effects";
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

  // Listen for updates to operations slice that may require view updates
  // yield takeLatest(updateOperationsSlice.type, function* (action) {
  //   const operationId = action.payload.id;
  //   const updatedAttributes = Object.keys(action.payload);
  //   const dependentProps = [
  //     "children", // affects both stack and pack operations
  //     "operationType", // affects both stack and pack operations
  //     "joinType", // specific to pack operations
  //     "joinKey1", // specific to pack operations
  //     "joinKey2", // specific to pack operations
  //     "joinPredicate", // specific to pack operations
  //   ];

  //   // If the operation has updated any of the dependent properties,
  //   // update the view
  //   if (updatedAttributes.some((attr) => dependentProps.includes(attr))) {
  //     yield put(createOperations(operationId));
  //   }
  // });
}
