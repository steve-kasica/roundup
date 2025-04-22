import { createSlice } from "@reduxjs/toolkit";
import { Column, COLUMN_STATUS_LOADING, COLUMN_STATUS_VISABLE } from ".";

const initialState = {
  entries: {},
  columnsByTable: {},
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "sourceColumns",
  initialState,
  reducers: {
    // Action to trigger the saga
    fetchSourceTableColumnsRequest: (state, action) => {
      const { tableId, columnCount } = action.payload;
      if (!Object.hasOwn(state.columnsByTable, tableId)) {
        state.columnsByTable[tableId] = [];
      }
      for (let i = 0; i < columnCount; i++) {
        const column = new Column(
          tableId,
          i,
          undefined,
          undefined,
          COLUMN_STATUS_LOADING
        );
        state.entries[column.id] = column;
        state.columnsByTable[tableId].push(column.id);
      }
    },
    fetchSourceTableColumnsSuccess: (state, action) => {
      const { tableId, response: columnsInfo } = action.payload;
      columnsInfo.forEach((columnInfo, i) => {
        const columnId = state.columnsByTable[tableId].at(i);
        const column = state.entries[columnId];

        column.name = columnInfo.name;
        column.columnType = columnInfo.is_numeric ? "categorical" : "numeric";
        column.status = COLUMN_STATUS_VISABLE;
        column.isLoading = false;
        column.error = null;
      });
    },
    fetchSourceTableColumnsFailure: (state, action) => {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching columns", action);
      }
    },
    renameColumnRequest: (state, action) => {
      const { id } = action.payload;
      const column = state.entries[id];
      if (column) {
        column.loading = true;
        column.error = null;
      }
    },
    renameColumnSuccess: (state, action) => {
      const { id, newColumnName } = action.payload;
      const column = state.entries[id];
      if (column) {
        column.loading = false;
        column.error = null;
        column.name = newColumnName;
      }
    },
    renameColumnFailure: (state, action) => {
      const { id } = action.payload;
      const column = state.entries[id];
      if (column) {
        column.loading = false;
        column.error = action.payload.error;
      }
    },
    /**
     * Update state to reflect the start of a column removal process.
     */
    removeColumnRequest: (state, action) => {
      const { id } = action.payload;
      const column = state.entries[id];
      if (column) {
        column.loading = true;
        column.error = null;
      }
    },
    /**
     * Update state to reflect the successful removal of a column
     * and remove the column from the columns array for that particular
     * project.
     */
    removeColumnSuccess: (state, action) => {
      const { id } = action.payload;
      const column = state.entries[id];
      if (column) {
        delete state.entries[id];
        state.columnsByTable[column.parentId] = state.columnsByTable[
          column.parentId
        ].filter((c) => c.id !== id);
      }
    },
    /**
     * Update state to reflect the failure of a column removal process.
     */
    removeColumnFailure: (state, action) => {
      const { id, error } = action.payload;
      const column = state.entries[id];
      if (column) {
        column.loading = false;
        column.error = error;
      }
    },
  },
});

export default slice;
