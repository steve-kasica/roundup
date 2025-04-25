import { createSlice } from "@reduxjs/toolkit";
import Column, { COLUMN_STATUS_LOADING, COLUMN_STATUS_VISABLE } from "./Column";

const initialState = {
  idsByTable: {},
  data: {},
};

const columnsSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {
    /**
     * Triggers a saga to fetch columns for a specific table.
     * Initializes placeholder columns with a loading status.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.tableId - The ID of the table to fetch columns for.
     * @param {number} action.payload.columnCount - The number of columns to initialize.
     */
    fetchSourceTableColumnsRequest(state, action) {
      const { tableId, columnCount } = action.payload;
      if (!Object.hasOwn(state.idsByTable, tableId)) {
        state.idsByTable[tableId] = [];
      }
      for (let i = 0; i < columnCount; i++) {
        const column = new Column(
          tableId,
          i,
          undefined,
          undefined,
          COLUMN_STATUS_LOADING
        );
        state.data[column.id] = column;
        state.idsByTable[tableId].push(column.id);
      }
    },

    /**
     * Updates the state with the fetched column data for a specific table.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.tableId - The ID of the table whose columns were fetched.
     * @param {Array<Object>} action.payload.response - The array of column data fetched from the server.
     */
    fetchSourceTableColumnsSuccess(state, action) {
      const { tableId, response: columnsInfo } = action.payload;
      columnsInfo.forEach((columnInfo, i) => {
        const columnId = state.idsByTable[tableId].at(i);
        const column = state.data[columnId];

        column.name = columnInfo.name;
        column.columnType = columnInfo.is_numeric ? "categorical" : "numeric";
        column.status = COLUMN_STATUS_VISABLE;
        column.isLoading = false;
        column.error = null;
      });
    },

    /**
     * Handles a failure to fetch columns for a specific table.
     * Logs an error in development mode.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     */
    fetchSourceTableColumnsFailure(state, action) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching columns", action);
      }
    },

    /**
     * Marks a column as loading when a rename request is initiated.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.id - The ID of the column to rename.
     */
    renameColumnRequest(state, action) {
      const { id } = action.payload;
      const column = state.data[id];
      if (column) {
        column.loading = true;
        column.error = null;
      }
    },

    /**
     * Updates the column name after a successful rename operation.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.id - The ID of the renamed column.
     * @param {string} action.payload.newColumnName - The new name of the column.
     */
    renameColumnSuccess(state, action) {
      const { id, newColumnName } = action.payload;
      const column = state.data[id];
      if (column) {
        column.loading = false;
        column.error = null;
        column.name = newColumnName;
      }
    },

    /**
     * Handles a failure to rename a column.
     * Updates the column's error state.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.id - The ID of the column that failed to rename.
     * @param {string} action.payload.error - The error message.
     */
    renameColumnFailure(state, action) {
      const { id } = action.payload;
      const column = state.data[id];
      if (column) {
        column.loading = false;
        column.error = action.payload.error;
      }
    },

    /**
     * Marks a column as loading when a remove request is initiated.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload - The ID of the column to remove.
     */
    removeColumnRequest(state, action) {
      const id = action.payload;
      const column = state.data[id];
      if (column) {
        column.loading = true;
        column.error = null;
      }
    },

    /**
     * Removes a column from the state after a successful removal operation.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.id - The ID of the removed column.
     */
    removeColumnSuccess(state, action) {
      const { id } = action.payload;
      const column = state.data[id];
      if (column) {
        delete state.data[id];
        state.idsByTable[column.tableId] = state.idsByTable[
          column.tableId
        ].filter((cid) => cid !== id);
      }
    },

    /**
     * Handles a failure to remove a column.
     * Updates the column's error state.
     *
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string} action.payload.id - The ID of the column that failed to remove.
     * @param {string} action.payload.error - The error message.
     */
    removeColumnFailure(state, action) {
      const { id, error } = action.payload;
      const column = state.data[id];
      if (column) {
        column.loading = false;
        column.error = error;
      }
    },
  },
});

export default columnsSlice.reducer;

export const {
  fetchSourceTableColumnsRequest,
  fetchSourceTableColumnsSuccess,
  fetchSourceTableColumnsFailure,
  renameColumnRequest,
  renameColumnSuccess,
  renameColumnFailure,
  removeColumnRequest,
  removeColumnSuccess,
  removeColumnFailure,
} = columnsSlice.actions;
