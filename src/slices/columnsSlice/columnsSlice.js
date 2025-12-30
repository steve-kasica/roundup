/**
 * @fileoverview Redux slice for managing column metadata.
 * @module slices/columnsSlice/columnsSlice
 *
 * Manages column state in normalized byId/allIds structure.
 * Columns belong to tables or operations and store metadata
 * like type, statistics, and display properties.
 *
 * Features:
 * - Add columns (validates no duplicates)
 * - Update column properties
 * - Delete columns by ID
 * - Normalized state for efficient lookups
 *
 * @example
 * import { addColumns, updateColumns, deleteColumns } from './columnsSlice';
 * dispatch(addColumns([{ id: 'col_1', parentId: 't1', name: 'Name' }]));
 */

import { normalizeInputToArray } from "../utilities";
import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  allIds: [],
  byId: {},
};

const columnsSlice = createSlice({
  name: "columns",
  initialState,
  reducers: {
    /**
     * Adds one or more columns to the state.
     *
     * @param {Object} state - The current Redux state slice for columns.
     * @param {Object} action - The Redux action object.
     * @param {Array|Object} action.payload - The column or array of columns to add.
     */
    addColumns(state, action) {
      let columns = normalizeInputToArray(action.payload);

      columns.forEach((column) => {
        if (state.byId[column.id]) {
          throw new Error(`Column with id ${column.id} already exists`);
        }
        // Add the column to the data object
        state.byId[column.id] = column;
        state.allIds.push(column.id);
      });
    },

    updateColumns(state, action) {
      let columnUpdates = normalizeInputToArray(action.payload);

      columnUpdates.forEach((columnUpdate) => {
        if (!state.byId[columnUpdate.id]) {
          throw new Error(`Column with id ${columnUpdate.id} does not exist`);
        }
        state.byId[columnUpdate.id] = {
          ...state.byId[columnUpdate.id],
          ...columnUpdate,
        };
      });
    },

    deleteColumns(state, action) {
      const columnIdsToDelete = normalizeInputToArray(action.payload);
      columnIdsToDelete.forEach((id) => {
        if (!state.byId[id]) {
          throw new Error(`Column with id ${id} does not exist`);
        }
        delete state.byId[id];
        state.allIds = state.allIds.filter((columnId) => columnId !== id);
      });
    },
  },
});

export default columnsSlice.reducer;

export const { addColumns, deleteColumns, updateColumns } =
  columnsSlice.actions;
