import { call, select, takeEvery } from "redux-saga/effects";
import {
  updateOperationsFailure,
  updateOperationsSuccess,
} from "../updateOperationsSaga";
import {
  createOperationsFailure,
  createOperationsSuccess,
} from "../createOperationsSaga/actions";
import alertsSagaWorker from "./worker";

export default function* updateAlertsSagaWatcher() {
  // yield takeEvery(updateOperationsSuccess.type, handleRaisedAlerts);
  // yield takeEvery(updateOperationsFailure.type, handleRaisedAlerts);
  // yield takeEvery(createOperationsSuccess.type, handleRaisedAlerts);
  // yield takeEvery(createOperationsFailure.type, handleRaisedAlerts);
}

function* handleRaisedAlerts(action) {
  const { raisedAlerts } = action.payload;
  if (raisedAlerts.length > 0) {
    // If any alerts were raised during creation, pass them along.
    yield call(alertsSagaWorker, raisedAlerts);
  }
}
