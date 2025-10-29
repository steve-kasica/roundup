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
  // If an operation was updated successfully, it still needs to be
  // check for warning-level alerts, depending on what property was changed.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const propertiesThatRaiseAlerts = ["children"];
    const { changedPropertiesByOperation } = action.payload;
    const operationIdsToCheck = [];
    for (let [operationId, changedProperties] of Object.entries(
      changedPropertiesByOperation
    )) {
      if (
        changedProperties.some((property) =>
          propertiesThatRaiseAlerts.includes(property)
        )
      ) {
        operationIdsToCheck.push({ id: operationId });
      }
    }
    yield call(alertsSagaWorker, operationIdsToCheck);
  });

  // If an update operation fails, then an error-level alert was raised.
  // And that needs to be passed along to the user.
  yield takeEvery(updateOperationsFailure.type, function* (action) {
    const { raisedAlerts } = action.payload;
    yield call(
      alertsSagaWorker,
      raisedAlerts.map((alert) => ({ id: alert.sourceId, error: alert }))
    );
  });

  // Handle successful create operations by checking for warning-level
  // alerts that may need to be raised.
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const { successfulCreations } = action.payload;
    yield call(alertsSagaWorker, successfulCreations);
  });

  // Handle successful create operations by checking for warning-level
  // alerts that may need to be raised.
  yield takeEvery(createOperationsFailure.type, function* (action) {
    // Handle failed create operations by raising error-level alerts.
    const { failedCreations } = action.payload;
    yield call(alertsSagaWorker, failedCreations);
  });
}
