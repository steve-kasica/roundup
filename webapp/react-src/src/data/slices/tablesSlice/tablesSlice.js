/**
 * @name tablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";
import { Table } from "./Table";

const initialState = {
  ids: [],
  data: {},
  loading: [],
  error: null,
};

const slice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    /**
     * Adds one or more new tables to the state. Mapping data from remote
     * sources to Open Roundup's table structure is handled upstream.
     *
     * @param {Object} state - The current Redux slice state, containing `ids` (array of table IDs) and `data` (object mapping IDs to table objects).
     * @param {Object} action - The Redux action object.
     * @param {Object|Object[]} action.payload - A single table object or an array of table objects to add.
     * @throws {Error} If a table with the same ID already exists in the state.
     */
    addTables(state, action) {
      let tables = action.payload;
      if (!Array.isArray(tables)) {
        tables = [tables];
      }
      tables.forEach((table) => {
        if (state.ids.includes(table.id)) {
          throw new Error(`Table with ID ${table.id} already exists`);
        }
        state.ids.push(table.id);
        state.data[table.id] = table;
      });
    },

    /**
     * Removes one or more tables from the state by their IDs.
     *
     * @param {Object} state - The current state of the tables slice.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - The ID or array of IDs of the tables to remove.
     * @throws {Error} If any of the specified table IDs do not exist in the state.
     *
     * This reducer:
     * - Accepts a single table ID or an array of table IDs in the action payload.
     * - Throws an error if any specified table ID does not exist in the state.
     * - Removes the specified table IDs from the `ids` array.
     * - Deletes the corresponding entries from the `data` object.
     */
    removeTables(state, action) {
      let tableIds = action.payload;
      if (!Array.isArray(tableIds)) {
        tableIds = [tableIds];
      }
      tableIds.forEach((tableId) => {
        // Check if the table exists
        if (!state.data[tableId]) {
          throw new Error(`Table with ID ${tableId} does not exist`);
        }
        // Remove the table from the list of IDs
        state.ids = state.ids.filter((id) => id !== tableId);
        // Remove the table from the data object
        delete state.data[tableId];
      });
    },

    /**
     * Reducer to add one or more table IDs to the loading state.
     *
     * @param {Object} state - The current state of the tables slice.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - A single table ID or an array of table IDs to add to the loading array.
     *
     * @returns {void}
     */
    addTablesToLoading(state, action) {
      let tableIds = action.payload;
      if (!Array.isArray(tableIds)) {
        tableIds = [tableIds];
      }
      // Add the table IDs to the loading array
      state.loading = state.loading.concat(tableIds);
    },

    /**
     * Removes one or more table IDs from the loading array in the state.
     *
     * @param {Object} state - The current Redux slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - A single table ID or an array of table IDs to remove from the loading array.
     */
    removeTablesFromLoading(state, action) {
      let tableIds = action.payload;
      if (!Array.isArray(tableIds)) {
        tableIds = [tableIds];
      }
      // Remove the table IDs from the loading array
      state.loading = state.loading.filter((id) => !tableIds.includes(id));
    },

    /**
     * Redux reducer to change the name of a table.
     *
     * @param {Object} state - The current state of the tables slice.
     * @param {Object} action - The dispatched action containing payload.
     * @param {Object} action.payload - The payload object.
     * @param {string|number} action.payload.tableId - The unique identifier of the table to rename.
     * @param {string} action.payload.newName - The new name to assign to the table.
     * @throws {Error} Throws an error if the table with the specified ID does not exist.
     */
    changeTableName(state, action) {
      const { tableId, newName } = action.payload;
      // Check if the table exists
      if (!state.data[tableId]) {
        throw new Error(`Table with ID ${tableId} does not exist`);
      }
      // Update the table name
      state.data[tableId].name = newName;
    },

    incrementRowsExplored: (state, action) => {
      const { tableId, rowsExplored } = action.payload;
      const table = state.data[tableId];
      if (table) {
        table.rowsExplored += rowsExplored;
      } else {
        throw new Error(`Table with ID ${tableId} not found`);
      }
    },

    setTableColumnIds(state, action) {
      const { tableId, columnIds } = action.payload;
      // Check if the table exists
      if (!state.data[tableId]) {
        throw new Error(`Table with ID ${tableId} does not exist`);
      } else {
        // Update the table's column IDs
        state.data[tableId].columnIds = columnIds;
      }
    },
  },
});

export const {
  addTables,
  removeTables,
  addTablesToLoading,
  removeTablesFromLoading,
  changeTableName,
  incrementRowsExplored,
  setTableColumnIds,
} = slice.actions;

export default slice;
