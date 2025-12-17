import { createSelector } from "@reduxjs/toolkit";
import { SEVERITY_ERROR, SEVERITY_WARNING } from ".";

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
    const alert = Object.values(byId).filter(
      (alert) => alert.sourceId === sourceId
    );
    return alert.map((a) => a.id);
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

/**
 * Selector to retrieve all alert IDs from the Redux state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {Array<string>} An array of all alert IDs.
 */
export const selectAllAlertIds = (state) => state.alerts.allIds;

export const selectAlertWarningCount = createSelector(
  [(state) => state.alerts.byId, (state, sourceId) => sourceId],
  (byId, sourceId) => {
    const warnings = Object.values(byId).filter(
      (alert) =>
        alert.sourceId === sourceId && alert.severity === SEVERITY_WARNING
    );
    return warnings.length;
  }
);

export const selectAlertErrorCount = createSelector(
  [(state) => state.alerts.byId, (state, sourceId) => sourceId],
  (byId, sourceId) => {
    const errors = Object.values(byId).filter(
      (alert) =>
        alert.sourceId === sourceId && alert.severity === SEVERITY_ERROR
    );
    return errors.length;
  }
);

export const selectSilencedWarningCount = createSelector(
  [(state) => state.alerts.byId, (state, sourceId) => sourceId],
  (byId, sourceId) => {
    const silenced = Object.values(byId).filter(
      (alert) =>
        alert.sourceId === sourceId &&
        alert.severity === SEVERITY_WARNING &&
        alert.isSilenced === true
    );
    return silenced.length;
  }
);
