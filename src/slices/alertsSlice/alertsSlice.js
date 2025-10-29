import { createSlice } from "@reduxjs/toolkit";

// This functional essentially implement a _composite key_ strategy for
// detect duplicate alerts, which preserving a _primary key_ alert ID.
function getAlertSignature(alert) {
  // Combine type + sourceId + any other discriminating fields
  const parts = [
    alert.type || alert.alertType,
    alert.sourceId,
    // Add other fields that make the alert unique
    alert.columnId, // if relevant
    alert.severity, // if two warnings of same type but different severity are distinct
  ].filter(Boolean); // Remove undefined values

  return parts.join("::");
}

const initialState = {
  bySourceId: {},
  bySignature: {}, // New index for O(1) duplicate detection
  ids: [],
  data: {},
};

const alertsSlice = createSlice({
  name: "alerts",
  initialState,
  reducers: {
    addAlerts(state, action) {
      let alerts = action.payload;
      if (!Array.isArray(alerts)) {
        alerts = [alerts];
      }
      alerts.forEach((alert) => {
        const signature = getAlertSignature(alert);

        // Check if alert with this signature already exists
        if (state.bySignature[signature]) {
          // Optionally update the existing alert instead of skipping
          const existingId = state.bySignature[signature];
          state.data[existingId] = { ...state.data[existingId], ...alert };
          return;
        }

        // Add new alert
        state.ids.push(alert.id);
        state.data[alert.id] = alert;
        state.bySignature[signature] = alert.id;

        if (!state.bySourceId[alert.sourceId]) {
          state.bySourceId[alert.sourceId] = [];
        }
        state.bySourceId[alert.sourceId].push(alert.id);
      });
    },
    removeAlerts(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (state.data[id]) {
          const alert = state.data[id];
          const signature = getAlertSignature(alert);

          // Remove from bySignature index
          delete state.bySignature[signature];

          // Remove from bySourceId
          state.bySourceId[alert.sourceId] = state.bySourceId[
            alert.sourceId
          ].filter((valueId) => valueId !== id);

          delete state.data[id];
          state.ids = state.ids.filter((valueId) => valueId !== id);
        }
      });
    },
    removeAlertsBySourceIds(state, action) {
      let sourceIds = action.payload;
      if (!Array.isArray(sourceIds)) {
        sourceIds = [sourceIds];
      }
      sourceIds.forEach((sourceId) => {
        const alertIds = state.bySourceId[sourceId] || [];
        alertIds.forEach((id) => {
          // Remove error from state data
          delete state.data[id];

          // Remove error id from state ids
          state.ids = state.ids.filter((valueId) => valueId !== id);
        });
        // Remove the sourceId entry
        delete state.bySourceId[sourceId];
      });
    },
    clearData(state) {
      state = initialState;
      return state;
    },
  },
});

export const { addAlerts, removeAlerts, clearData, removeAlertsBySourceIds } =
  alertsSlice.actions;
export default alertsSlice.reducer;
