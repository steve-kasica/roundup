/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  drawerContents: null,
  selectedColumns: [],
  focusedTableId: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDrawerContents(state, action) {
      state.drawerContents = action.payload;
    },
    setFocusedTableId(state, action) {
      state.focusedTableId = action.payload;
    },
    appendToSelectedColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selectedColumns = [...state.selectedColumns, ...columnIds];
    },
    setSelectedColumns(state, action) {
      if (!Array.isArray(action.payload)) {
        throw new Error("setSelectedColumns: payload must be an array");
      }
      state.selectedColumns = action.payload;
    },
    clearSelectedColumns(state) {
      state.selectedColumns = initialState.selectedColumns;
    },
    removeFromSelectedColumns(state, action) {
      state.selectedColumns = state.selectedColumns.filter(
        (column) => column !== action.payload
      );
    },
  },
});

// Action
export const {
  setDrawerContents,
  setFocusedTableId,
  setSelectedColumns,
  appendToSelectedColumns,
  clearSelectedColumns,
  removeFromSelectedColumns,
} = uiSlice.actions;

export default uiSlice.reducer;
