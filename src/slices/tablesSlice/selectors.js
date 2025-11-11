import { createSelector } from "reselect";

/**
 * Memoized selector to retrieve table data by ID or an array of IDs from the Redux state.
 *
 * @param {Object} state - The Redux state object.
 * @param {string|string[]} tableIds - A single table ID or an array of table IDs.
 * @returns {Object|Object[]} The table data object if a single ID is provided, or an array of table data objects if an array of IDs is provided.
 */
export const selectTablesById = createSelector(
  [(state) => state.tables.data, (state, tableIds) => tableIds],
  (tablesData, tableIds) => {
    if (Array.isArray(tableIds)) {
      return tableIds.map((id) => tablesData[id]);
    }
    return tablesData[tableIds];
  }
);

/**
 * Select active column IDs (not excluded) for a specific table.
 *
 * This selector returns only the columns that are currently included in the table's
 * idsByTable array. When columns are excluded via `setTablesColumnIds`, they are
 * removed from this array but remain in the columns.data object. This selector is
 * used to determine which columns should be displayed and operated on.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get active columns for.
 * @returns {Array<string>} An array of column IDs that are active (not excluded) for the table.
 *                          Returns an empty array if the table has no columns or doesn't exist.
 *
 * @example
 * const activeColumnIds = selectTableColumnIds(state, 't1');
 * // Returns: ['c1', 'c2', 'c3']
 */
export const selectTableColumnIds = (state, tableId) => {
  if (!state.tables.byId[tableId]) {
    throw new Error(`No columns found for table ID ${tableId}`);
  }
  return state.tables.byId[tableId].columnIds;
};

/**
 * Selector to retrieve all table data as an array.
 *
 * @function
 * @param {Object} state - The Redux state object.
 * @returns {Array<Object>} An array containing all table data objects.
 */
export const selectAllTablesData = createSelector(
  [(state) => state.tables.data],
  (data) => Object.values(data)
);
