import { createSelector } from "reselect";
import { selectColumnById } from "../columnsSlice";

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
 * Selector to retrieve table(s) associated with the given column ID(s).
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string|string[]} columnIds - A single column ID or an array of column IDs.
 * @returns {Object|Object[]} The table object(s) corresponding to the provided column ID(s).
 *
 */
export const selectTableByColumnId = createSelector(
  // Input selectors
  (state, columnIds) => (Array.isArray(columnIds) ? columnIds : [columnIds]),
  (state) => state,
  // Result function
  (columnIds, state) => {
    const tableIds = columnIds.map(
      (columnId) => selectColumnById(state, columnId).tableId
    );
    return selectTablesById(
      state,
      tableIds.length === 1 ? tableIds[0] : tableIds
    );
  }
);

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

export const selectSelectedTables = (state) => state.tables.selected;
export const selectHoveredTable = (state) => state.tables.hovered;

export const selectFocusedTableId = (state) => state.tables.focused;
