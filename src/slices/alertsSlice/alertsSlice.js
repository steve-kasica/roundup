import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  bySourceId: {},
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
      alerts.forEach((error) => {
        if (!state.data[error.id]) {
          // Only add if the error is not already present
          // This prevents duplicates in the state
          state.ids.push(error.id);
          state.data[error.id] = error;
          if (!state.bySourceId[error.sourceId]) {
            state.bySourceId[error.sourceId] = [];
          }
          state.bySourceId[error.sourceId].push(error.id);
        }
      });
    },
    removeAlerts(state, action) {
      let ids = action.payload;
      if (!Array.isArray(ids)) {
        ids = [ids];
      }
      ids.forEach((id) => {
        if (state.data[id]) {
          // Remove the error from error ids by sourceId
          state.bySourceId[state.data[id].sourceId] = state.bySourceId[
            state.data[id].sourceId
          ].filter((valueId) => valueId !== id);

          // Remove error from state data
          delete state.data[id];

          // Remove error id from state ids
          state.ids = state.ids.filter((valueId) => valueId !== id);
        }
      });
    },
    clearData(state) {
      state = initialState;
      return state;
    },
  },
});

export const { addAlerts, removeAlerts, clearData } = alertsSlice.actions;
export default alertsSlice.reducer;
