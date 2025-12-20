// Worker saga

import { put, select } from "redux-saga/effects";
import {
  addAlerts as addAlertsToSlice,
  deleteAlerts as deleteAlertsFromSlice,
} from "../../slices/alertsSlice/alertsSlice";
import { selectAlertIdsBySourceId } from "../../slices/alertsSlice";

// The raised alerts payload includes an array of source Ids and their associated alerts
export default function* alertsSagaWorker(raisedAlerts) {
  const alertsToAdd = [];
  const alertsToDelete = [];

  for (const { id, alerts } of raisedAlerts) {
    const associatedAlerts = yield select((state) =>
      selectAlertIdsBySourceId(state, id)
    );
    const existingAlerts = new Set(associatedAlerts);

    for (const alert of alerts) {
      const isRaised = existingAlerts.has(alert.id);
      if (isRaised && !alert.isPassing) {
        // Alert already exists, and is not resolved, so no action needed
        // Silenced alerts will also fall into this category
        existingAlerts.delete(alert.id);
      } else if (isRaised && alert.isPassing) {
        // Alert was raised but it is now passing, so clear it
        alertsToDelete.push(alert.id);
        existingAlerts.delete(alert.id);
      } else if (!isRaised && !alert.isPassing) {
        // New alert is raised
        alertsToAdd.push(alert);
      }
    }

    console.log("alertsToAdd:", alertsToAdd);
    // Any remaining alerts in existingAlerts are no longer raised
    for (const alertId of existingAlerts) {
      alertsToDelete.push(alertId);
    }

    if (alertsToAdd.length > 0) {
      yield put(addAlertsToSlice(alertsToAdd));
    }

    // If any objects were validation and no alerts were raised, clear existing alerts
    if (alertsToDelete.length > 0) {
      yield put(deleteAlertsFromSlice(alertsToDelete));
    }
  }
}
