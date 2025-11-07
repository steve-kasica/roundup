import { createSelector } from "@reduxjs/toolkit";

// Memoized selector to prevent unnecessary rerenders when returning empty arrays
export const selectAlertIdsBySourceId = createSelector(
  [(state) => state.alerts.bySourceId, (state, sourceId) => sourceId],
  (bySourceId, sourceId) => {
    return bySourceId[sourceId] || [];
  }
);

export const selectAlertsById = createSelector(
  [(state) => state.alerts.data, (state, alertIds) => alertIds],
  (alertsData, alertIds) => {
    return alertIds.map((alertId) => alertsData[alertId]);
  }
);

export const selectAllSourceIdsWithAlerts = createSelector(
  [(state) => state.alerts.bySourceId],
  (bySourceId) => {
    return Object.keys(bySourceId);
  }
);

export const selectIsAlertRaised = (state, { signature }) => {
  return !!state.alerts.bySignature[signature];
};
