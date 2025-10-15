import { takeEvery, takeLatest } from "redux-saga/effects";
import { updateTablesRequest } from "./actions";
import updateTablesWorker from "./worker";
import { updateColumnsSuccess } from "../updateColumnsSaga";

/**
 * Saga watcher that listens for the `updateTablesRequest` action and triggers the corresponding worker saga.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `updateTablesSagaWorker` whenever the `updateTablesRequest` action is dispatched.
 */
export default function* updateTablesSagaWatcher() {
  yield takeEvery(updateTablesRequest.type, updateTablesWorker);
}
