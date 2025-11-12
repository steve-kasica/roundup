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

export const { addAlerts, deleteAlerts } = alertsSlice.actions;
export default alertsSlice.reducer;
