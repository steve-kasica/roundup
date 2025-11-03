import { createSlice } from "@reduxjs/toolkit";

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
        // Check if alert with this signature already exists
        if (state.bySignature[alert.signature]) {
          // Optionally update the existing alert instead of skipping
          const existingId = state.bySignature[alert.signature];
          state.data[existingId] = { ...state.data[existingId], ...alert };
          return;
        }

        // Add new alert
        state.ids.push(alert.id);
        state.data[alert.id] = alert;
        state.bySignature[alert.signature] = alert.id;

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

          // Remove from bySignature index
          delete state.bySignature[alert.signature];

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
    removeAlertsBySignature(state, action) {
      let signatures = action.payload;
      if (!Array.isArray(signatures)) {
        signatures = [signatures];
      }
      signatures.forEach((signature) => {
        if (state.bySignature[signature]) {
          const id = state.bySignature[signature];
          const alert = state.data[id];

          // Remove signature index
          delete state.bySignature[signature];

          if (alert) {
            // Remove alert data
            delete state.data[alert.id];

            // Remove id from ids array
            state.ids = state.ids.filter((valueId) => valueId !== alert.id);

            // Remove id from bySourceId and clean up empty arrays
            if (alert.sourceId && state.bySourceId[alert.sourceId]) {
              state.bySourceId[alert.sourceId] = state.bySourceId[
                alert.sourceId
              ].filter((valueId) => valueId !== alert.id);

              if (state.bySourceId[alert.sourceId].length === 0) {
                delete state.bySourceId[alert.sourceId];
              }
            }
          }
        }
      });
    },
  },
});

export const {
  addAlerts,
  removeAlerts,
  clearData,
  removeAlertsBySourceIds,
  removeAlertsBySignature,
} = alertsSlice.actions;
export default alertsSlice.reducer;
