import { takeEvery } from "redux-saga/effects";
import { materializeOperationRequest } from "./actions";
import materializeOperationWorker from "./worker";

export default function* materializeOperationSagaWatcher() {
  yield takeEvery(materializeOperationRequest.type, materializeOperationWorker);
}
