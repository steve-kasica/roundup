/**
 * @fileoverview Redux slice for managing application alerts.
 * @module slices/alertsSlice/alertsSlice
 *
 * Manages alert state for validation errors, warnings, and notifications.
 * Uses normalized state structure with byId/allIds pattern.
 *
 * Features:
 * - Add new alerts (skips duplicates)
 * - Update existing alert properties
 * - Delete alerts by ID
 * - Normalized state for efficient lookups
 *
 * @example
 * import { addAlerts, deleteAlerts } from './alertsSlice';
 * dispatch(addAlerts([{ id: 'alert_1', severity: 'error', ... }]));
 */
import { createSlice } from "@reduxjs/toolkit";
import { normalizeInputToArray } from "../utilities";

export const initialState = {
  allIds: [],
  byId: {},
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    addAlerts(state, action) {
      normalizeInputToArray(action.payload).forEach((alert) => {
        // skip if alert already exists
        if (!state.byId[alert.id]) {
          // Add new alert
          state.allIds.push(alert.id);
          state.byId[alert.id] = alert;
        }
      });
    },
    updateAlerts(state, action) {
      normalizeInputToArray(action.payload).forEach((alert) => {
        if (state.byId[alert.id]) {
          state.byId[alert.id] = {
            ...state.byId[alert.id],
            ...alert,
          };
        }
      });
    },
    deleteAlerts(state, action) {
      normalizeInputToArray(action.payload).forEach((id) => {
        if (state.byId[id]) {
          delete state.byId[id];
          state.allIds = state.allIds.filter((valueId) => valueId !== id);
        }
      });
    },
  },
});

export const { addAlerts, updateAlerts, deleteAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
