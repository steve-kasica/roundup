import { takeEvery } from "redux-saga/effects";
import { instantiateViewRequest } from "./actions";
import instantiateViewWorker from "./worker";

export default function* instantiateViewSagaWatcher() {
  yield takeEvery(instantiateViewRequest.type, instantiateViewWorker);
}
