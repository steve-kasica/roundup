import { takeEvery } from "redux-saga/effects";
import { createTablesRequest } from "./actions";
import addTablesWorker from "./worker";

export default function* createTablesWatcher() {
  yield takeEvery(createTablesRequest.type, addTablesWorker);
}
