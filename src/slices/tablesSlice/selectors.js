/**
 * @fileoverview Redux selectors for table state.
 * @module slices/tablesSlice/selectors
 *
 * Provides memoized selectors for querying table state including
 * table metadata, column references, and query data generation.
 *
 * Features:
 * - Select tables by ID
 * - Get all table IDs
 * - Get column IDs for tables
 * - Generate query data for database operations
 * - Get all tables as array
 *
 * @example
 * import { selectTablesById, selectTableColumnIds } from './selectors';
 * const table = selectTablesById(state, 't1');
 */
import { createSelector } from "reselect";
import { normalizeInputToArray } from "../utilities";
import { selectColumnsById } from "../columnsSlice";

export const selectAllTableIds = (state) => state.tables.allIds;

/**
 * Memoized selector to retrieve table metadata by ID or an array of IDs from the Redux state.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|string[]} tableIds - A single table ID or an array of table IDs.
 * @returns {Object|Object[]} The table metadata object if a single ID is provided, or an array of table metadata objects if an array of IDs is provided.
 */
export const selectTablesById = createSelector(
  [(state) => state.tables.byId, (state, tableIds) => tableIds],
  (tablesData, tableIds) => {
    if (Array.isArray(tableIds)) {
      return tableIds.map((id) => tablesData[id]);
    }
    return tablesData[tableIds];
  }
);

/**
 * Select active column IDs (not hided) for a specific table.
 *
 * This selector returns only the columns that are currently included in the table's
 * idsByTable array. When columns are hided via `setTablesColumnIds`, they are
 * removed from this array but remain in the columns.byId object. This selector is
 * used to determine which columns should be displayed and operated on.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get active columns for.
 * @returns {Array<string>} An array of column IDs that are active (not hided) for the table.
 *                          Returns an empty array if the table has no columns or doesn't exist.
 *
 * @example
 * const activeColumnIds = selectTableColumnIds(state, 't1');
 * // Returns: ['c1', 'c2', 'c3']
 */
export const selectTableColumnIds = createSelector(
  [
    (state) => state.tables.byId,
    (state, tableIds) => normalizeInputToArray(tableIds),
  ],
  (tablesById, tableIds) => {
    const output = tableIds.map((tableId) => {
      if (!tablesById[tableId]) {
        throw new Error(`No columns found for table ID ${tableId}`);
      }
      return tablesById[tableId].columnIds;
    });
    return tableIds.length === 1 ? output[0] : output;
  }
);

/**
 * Selector to retrieve all table metadata as an array.
 *
 * @function
 * @param {Object} state - The Redux state object.
 * @returns {Array<Object>} An array containing all table metadata objects.
 */
export const selectAllTablesData = createSelector(
  [(state) => state.tables.byId],
  (byId) => Object.values(byId)
);

export const selectTableQueryData = createSelector(
  [
    (state, tableId) => selectTablesById(state, tableId),
    (state, tableId) =>
      selectColumnsById(state, selectTablesById(state, tableId).columnIds),
  ],
  (table, columns) => {
    return {
      tableName: table.databaseName,
      columnNames: columns.map((col) => col.databaseName),
    };
  }
);

/**
 * Selector to get all table IDs associated with given parent operation IDs.
 *
 * @function
 * @param {Object} state - The Redux state object.
 * @param {string|string[]} parentIds - A single parent operation ID or an array of parent operation IDs.
 * @returns {string[]|string[][]} An array of table IDs if a single parent ID is provided,
 *                                or an array of arrays of table IDs if multiple parent IDs are provided.
 *
 * @example
 * // For a single parent ID
 * const tableIds = selectAllTableIdsByParentId(state, 'op1');
 * // Returns: ['t1', 't2']
 */
export const selectAllTableIdsByParentId = createSelector(
  [
    (state) => state.tables.byId,
    (state, parentIds) => normalizeInputToArray(parentIds),
  ],
  (tablesById, parentIds) => {
    const output = parentIds.map((parentId) => {
      return Object.values(tablesById)
        .filter((table) => table.parentId === parentId)
        .map((table) => table.id);
    });
    return parentIds.length === 1 ? output[0] : output;
  }
);
