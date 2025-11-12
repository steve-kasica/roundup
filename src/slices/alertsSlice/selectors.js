import { createSelector } from "@reduxjs/toolkit";

/**
 * Selector to retrieve alert IDs associated with a specific source ID.
 *
 * @function
 * @param {Object} state - The Redux state object.
 * @param {string|number} sourceId - The ID of the source to filter alerts by.
 * @returns {Array<string|number>} An array containing the alert ID if found, otherwise an empty array.
 */
export const selectAlertIdsBySourceId = createSelector(
  [(state) => state.alerts.byId, (state, sourceId) => sourceId],
  (byId, sourceId) => {
    const alert = Object.values(byId).find(
      (alert) => alert.sourceId === sourceId
    );
    return alert ? [alert.id] : [];
  }
);

export const selectAlertsById = createSelector(
  [(state) => state.alerts.byId, (state, alertIds) => alertIds],
  (alertsData, alertIds) => {
    return Array.isArray(alertIds)
      ? alertIds.map((alertId) => alertsData[alertId])
      : alertsData[alertIds];
  }
);

export const selectAllSourceIdsWithAlerts = createSelector(
  [(state) => state.alerts.byId],
  (byId) => {
    const sourceIds = new Set();
    Object.values(byId).forEach((alert) => {
      sourceIds.add(alert.sourceId);
    });
    return Array.from(sourceIds);
  }
);
