import { call, takeEvery } from "redux-saga/effects";
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
  yield takeEvery(updateOperationsSuccess.type, function* () {
    // Handle successful update operations by checking for warning-level
    // alerts that may need to be raised.
  });
  yield takeEvery(updateOperationsFailure.type, function* (action) {
    // Handle failed update operations by raising error-level alerts.
  });

  yield takeEvery(createOperationsSuccess.type, function* (action) {
    // Handle successful create operations by checking for warning-level
    // alerts that may need to be raised.
    const { successfulCreations } = action.payload;
    yield call(alertsSagaWorker, successfulCreations);
  });

  yield takeEvery(createOperationsFailure.type, function* (action) {
    // Handle failed create operations by raising error-level alerts.
    const { failedCreations } = action.payload;
    yield call(alertsSagaWorker, failedCreations);
  });
}
