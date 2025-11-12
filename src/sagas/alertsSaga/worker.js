// Worker saga

import { put, select } from "redux-saga/effects";
import {
  addAlerts as addAlertsToSlice,
  deleteAlerts as deleteAlertsFromSlice,
} from "../../slices/alertsSlice/alertsSlice";
import { selectAllAlertIds } from "../../slices/alertsSlice";

export default function* alertsSagaWorker(raisedAlerts) {
  const alertsToAdd = [];
  const alertsToDelete = [];
  const alertIds = yield select(selectAllAlertIds);

  for (const alert of raisedAlerts) {
    const isRaised = alertIds.includes(alert.id);
    if (isRaised && !alert.isPassing) {
      // Alert already exists, skip
      continue;
    } else if (isRaised && alert.isPassing) {
      // Alert is passing, clear it
      alertsToDelete.push(alert.id);
    } else if (!isRaised && !alert.isPassing) {
      // New alert is raised
      alertsToAdd.push(alert);
    }
  }

  if (alertsToAdd.length > 0) {
    yield put(addAlertsToSlice(alertsToAdd));
  }

  // If any objects were validation and no alerts were raised, clear existing alerts
  if (alertsToDelete.length > 0) {
    yield put(deleteAlertsFromSlice(alertsToDelete));
  }
}
