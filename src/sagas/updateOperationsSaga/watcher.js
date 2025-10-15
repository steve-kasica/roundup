// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.

import { takeEvery } from "redux-saga/effects";
import { updateOperationsRequest } from "./actions";
import updateOperationsWorker from "./worker";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, updateOperationsWorker);
}
