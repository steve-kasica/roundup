import { takeEvery } from "redux-saga/effects";
import { deleteTablesRequest } from "./actions";
import deleteTablesWorker from "./worker";

export default function* deleteTablesSagaWatcher() {
  yield takeEvery(deleteTablesRequest.type, deleteTablesWorker);
}
