/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  drawerContents: null,
  selectedColumns: [],
  selectedTables: [],
  hoveredColumns: [],
  hoveredTable: null,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDrawerContents(state, action) {
      state.drawerContents = action.payload;
    },

    setSelectedColumns(state, action) {
      if (!Array.isArray(action.payload)) {
        throw new Error("setSelectedColumns: payload must be an array");
      }
      state.selectedColumns = action.payload;
    },
    appendToSelectedColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selectedColumns = [...state.selectedColumns, ...columnIds];
    },
    clearSelectedColumns(state) {
      state.selectedColumns = initialState.selectedColumns;
    },

    setSelectedTables(state, action) {
      const tableIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selectedTables = tableIds;
    },
    appendToSelectedTables(state, action) {
      const tableIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selectedTables = [...state.selectedTables, ...tableIds];
    },
    clearSelectedTables(state) {
      state.selectedTables = initialState.selectedTables;
    },
    setHoveredColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.hoveredColumns = columnIds;
    },
    appendToHoveredColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.hoveredColumns = [...state.hoveredColumns, ...columnIds];
    },
    removeFromHoveredColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.hoveredColumns = state.hoveredColumns.filter(
        (column) => !columnIds.includes(column)
      );
    },
    clearHoveredColumns(state) {
      state.hoveredColumns = initialState.hoveredColumns;
    },
    removeFromSelectedTables(state, action) {
      state.selectedTables = state.selectedTables.filter(
        (table) => table !== action.payload
      );
    },
    removeFromSelectedColumns(state, action) {
      state.selectedColumns = state.selectedColumns.filter(
        (column) => column !== action.payload
      );
    },
    setHoveredTable(state, action) {
      state.hoveredTable = action.payload;
    },
    clearHoveredTable(state) {
      state.hoveredTable = initialState.hoveredTable;
    },
  },
});

// Action
export const {
  setDrawerContents,

  setSelectedTables,
  appendToSelectedTables,
  clearSelectedTables,
  removeFromSelectedTables,

  setSelectedColumns,
  appendToSelectedColumns,
  clearSelectedColumns,
  removeFromSelectedColumns,

  setHoveredColumns,
  appendToHoveredColumns,
  clearHoveredColumns,
  removeFromHoveredColumns,

  setHoveredTable,
  clearHoveredTable,
} = uiSlice.actions;

export default uiSlice.reducer;
