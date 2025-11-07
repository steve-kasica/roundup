/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const LOD = {
  LOW: "low",
  HIGH: "high",
};

export const initialState = {
  drawerContents: null,
  hoveredColumn: null,
  hoveredTable: null,
  hoveredOperation: null,
  selectedTables: [],
  peekedTable: null,
  showColumnIndexDetails: false,
  dialogContent: null,
  levelOfDetail: LOD.HIGH, // set HIGH as default
  // Used to coordinate the visibility of columns
  // in Operations Detail with the Composite Table Schema
  opsDetailVisableColumns: [],

  focusedObject: null,
  selectedMatches: [],
  selectedColumnIndices: [],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSelectedTables(state, action) {
      const tableIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selectedTables = tableIds;
    },
    setSelectedColumnIndices(state, action) {
      const columnIndices = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.selectedColumnIndices = columnIndices;
    },
    setSelectedMatches(state, action) {
      state.selectedMatches = action.payload;
    },
    setFocusedObject(state, action) {
      state.focusedObject = action.payload;
    },
    setHoveredColumn(state, action) {
      state.hoveredColumn = action.payload;
    },
    setLevelOfDetail(state, action) {
      state.levelOfDetail = action.payload;
    },
    setDialogContent(state, action) {
      state.dialogContent = action.payload;
    },
    setShowColumnIndexDetails(state, action) {
      // action.payload should be a boolean
      if (typeof action.payload !== "boolean") {
        console.error("setShowColumnIndexDetails: payload must be a boolean");
        return;
      }
      state.showColumnIndexDetails = action.payload;
    },
    setDrawerContents(state, action) {
      state.drawerContents = action.payload;
    },
    setPeekedTable(state, action) {
      state.peekedTable = action.payload;
    },
    clearPeekedTable(state) {
      state.peekedTable = initialState.peekedTable;
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
    removeFromSelectedTables(state, action) {
      state.selectedTables = state.selectedTables.filter(
        (table) => table !== action.payload
      );
    },
    setHoveredTable(state, action) {
      state.hoveredTable = action.payload;
    },
    clearHoveredTable(state) {
      state.hoveredTable = initialState.hoveredTable;
    },
    addToOpsDetailVisableColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.opsDetailVisableColumns = [
        ...new Set([...state.opsDetailVisableColumns, ...columnIds]),
      ];
    },
    removeFromOpsDetailVisableColumns(state, action) {
      const columnIds = Array.isArray(action.payload)
        ? action.payload
        : [action.payload];
      state.opsDetailVisableColumns = state.opsDetailVisableColumns.filter(
        (column) => !columnIds.includes(column)
      );
    },
    clearOpsDetailVisableColumns(state) {
      state.opsDetailVisableColumns = initialState.opsDetailVisableColumns;
    },
  },
});

// Action
export const {
  setDrawerContents,
  setDialogContent,
  setLevelOfDetail,
  setSelectedColumnIndices,

  setPeekedTable,
  clearPeekedTable,

  setSelectedTables,
  appendToSelectedTables,
  clearSelectedTables,
  removeFromSelectedTables,

  setHoveredTable,
  setHoveredColumn,
  clearHoveredTable,
  addToOpsDetailVisableColumns,
  removeFromOpsDetailVisableColumns,
  clearOpsDetailVisableColumns,
  setShowColumnIndexDetails,

  setFocusedObject,
  setSelectedMatches,
} = uiSlice.actions;

export default uiSlice.reducer;
