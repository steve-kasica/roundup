/**
 * @name tablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";
import { normalizeInputToArray } from "../utilities";

export const initialState = {
  allIds: [],
  byId: {}, // Map of <tableId>: tableObject
};

const slice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    /**
     * Adds one or more new tables to the state. Mapping byId from remote
     * sources to Open Roundup's table structure is handled upstream.
     *
     * @param {Object} state - The current Redux slice state, containing `allIds` (array of table IDs) and `byId` (object mapping IDs to table objects).
     * @param {Object} action - The Redux action object.
     * @param {Object|Object[]} action.payload - A single table object or an array of table objects to add.
     * @throws {Error} If a table with the same ID already exists in the state.
     */
    addTables(state, action) {
      let tables = normalizeInputToArray(action.payload);
      tables.forEach((table) => {
        if (state.byId[table.id]) {
          throw new Error(`Table with ID ${table.id} already exists`);
        }
        state.allIds.push(table.id);
        state.byId[table.id] = table;
      });
    },

    /**
     * Updates existing tables in the state with new metadata about tables.
     *
     * Normalizes the input payload to an array and updates each table in the state
     * whose ID matches the provided update. Throws an error if a table with the given
     * ID does not exist in the state.
     *
     * @param {Object} state - The current Redux slice state containing table metadata.
     * @param {Object} action - The Redux action containing the payload.
     * @param {Object|Object[]} action.payload - The table update(s) to apply. Can be a single object or an array of objects.
     * @throws {Error} If a table with the specified ID does not exist in the state.
     */
    updateTables(state, action) {
      const tableUpdates = normalizeInputToArray(action.payload);

      tableUpdates.forEach((table) => {
        if (!state.byId[table.id]) {
          throw new Error(`Table with ID ${table.id} does not exist`);
        }
        state.byId[table.id] = {
          ...state.byId[table.id],
          ...table,
        };
      });
    },

    /**
     * Delete one or more tables from the state by their IDs.
     *
     * @param {Object} state - The current state of the tables slice.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - The ID or array of IDs of the tables to remove.
     * @throws {Error} If any of the specified table IDs do not exist in the state.
     *
     * This reducer:
     * - Accepts a single table ID or an array of table IDs in the action payload.
     * - Throws an error if any specified table ID does not exist in the state.
     * - Removes the specified table IDs from the `allIds` array.
     * - Deletes the corresponding entries from the `byId` object.
     */
    deleteTables(state, action) {
      const tableIdsToDelete = normalizeInputToArray(action.payload);
      tableIdsToDelete.forEach((tableId) => {
        // Check if the table exists
        if (!state.byId[tableId]) {
          throw new Error(`Table with ID ${tableId} does not exist`);
        }
        // Remove the table from the list of IDs
        state.allIds = state.allIds.filter((id) => id !== tableId);

        // Remove the table from the byId object
        delete state.byId[tableId];
      });
    },

    /**
     * Updates the column IDs for one or more tables in the state.
     *
     * Accepts an array or single object mapping table IDs to their new column ID arrays.
     * Throws an error if a specified table does not exist in the state.
     *
     * @param {Object} state - The current Redux slice state.
     * @param {Object} action - The Redux action containing the payload.
     * @param {Array<{tableId: string, columnIds: string[]}>|{tableId: string, columnIds: string[]}} action.payload
     *   - An array or single object specifying table IDs and their new column IDs.
     * @throws {Error} If a table with the specified ID does not exist in the state.
     */
    setTablesColumnIds(state, action) {
      const tableColumnMappings = normalizeInputToArray(action.payload);

      tableColumnMappings.forEach(({ tableId, columnIds }) => {
        // Check if the table exists
        if (!state.byId[tableId]) {
          throw new Error(`Table with ID ${tableId} does not exist`);
        }
        // Update the table's column IDs
        state.byId[tableId].columnIds = columnIds;
      });
    },
  }, // end reducers
});

export const { addTables, updateTables, deleteTables, setTablesColumnIds } =
  slice.actions;

export default slice;
