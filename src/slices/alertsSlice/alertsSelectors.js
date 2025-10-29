import { createSelector } from "@reduxjs/toolkit";

export const selectAlertIdsBySourceId = (state, sourceId) => {
  return state.alerts.bySourceId[sourceId] || [];
};

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
