import { createSelector } from "@reduxjs/toolkit";

export const selectDrawerContents = (state) => state.ui.drawerContents;

export const isColumnSelected = createSelector(
  (state) => state.ui.selectedColumns,
  (_, columnId) => columnId,
  (selectedColumns, columnId) => selectedColumns.includes(columnId)
);

export const selectLastSelectedColumn = (state) => {
  const selectedColumns = state.ui.selectedColumns;
  if (!selectedColumns || selectedColumns.length === 0) {
    return null;
  }
  return selectedColumns[selectedColumns.length - 1];
};

export const selectFirstSelectedColumn = (state) => {
  const selectedColumns = state.ui.selectedColumns;
  if (!selectedColumns || selectedColumns.length === 0) {
    return null;
  }
  return selectedColumns[0];
};

export const selectSelectedColumnIds = (state) => state.ui.selectedColumns;

export const selectSelectedTables = (state) => state.ui.selectedTables;
