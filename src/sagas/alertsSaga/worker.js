// Worker saga

import { put } from "redux-saga/effects";
import {
  addAlerts as addAlertsSliceRequest,
  removeAlertsBySignature as removeAlertsBySignatureSliceRequest,
} from "../../slices/alertsSlice/alertsSlice";

export default function* alertsSagaWorker(raisedAlerts) {
  const alertsToAdd = [];
  const alertsToClear = [];

  for (const alert of raisedAlerts) {
    const isRaised = true; // TODO
    if (isRaised && !alert.isPassing) {
      // Alert already exists, skip
      continue;
    } else if (isRaised && alert.isPassing) {
      // Alert is passing, clear it
      alertsToClear.push(alert.signature);
    } else if (!isRaised && !alert.isPassing) {
      // New alert is raised
      alertsToAdd.push(alert);
    }
  }

  if (alertsToAdd.length > 0) {
    yield put(addAlertsSliceRequest(alertsToAdd));
  }

  // If any objects were validation and no alerts were raised, clear existing alerts
  if (alertsToClear.length > 0) {
    yield put(removeAlertsBySignatureSliceRequest(alertsToClear));
  }
}
