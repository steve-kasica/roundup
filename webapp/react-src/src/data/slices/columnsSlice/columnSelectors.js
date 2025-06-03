import { createSelector } from "reselect";

/**
 * Selects all column IDs for a specific table.
 *
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table.
 * @returns {Array<string>} - An array of column IDs for the table.
 */
export function selectColumnIdsByTableId(state, tableId) {
  // Check if the tableId exists in the state
  if (!state.columns.idsByTable[tableId]) {
    // If not, return an empty array
    return [];
  }
  // If it exists, return the array of column IDs for that table
  // This is a fallback to ensure that we always return an array
  // even if the tableId is not found in the state
  return state.columns.idsByTable[tableId];
}

/**
 * Selects a specific column by its ID.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column.
 * @returns {Object|null} - The column object or null if not found.
 */
export const selectColumnById = createSelector(
  [(state) => state.columns.data, (_, id) => id],
  (data, id) => data[id] || null
);

/**
 * Selects the selected column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are currently selected.
 */
export const selectSelectedColumns = (state) => state.columns.selected;

/**
 * Selects the hovered column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are currently hovered.
 */
export const selectHoveredColumns = (state) => state.columns.hovered;

/**
 * Selects the loading column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are currently loading.
 */
export const selectLoadingColumns = (state) => state.columns.loading;

/**
 * Selects the dragging column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are currently dragging.
 */
export const selectDraggingColumns = (state) => state.columns.dragging;

/**
 * Memoized selector to retrieve columns by their index across multiple tables.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {number} index - The index of the column to select from each table.
 * @param {string[]} tableIds - An array of table IDs to select columns from.
 * @returns {Array<Object|null>} An array of column objects (or null if not found) corresponding to the specified index in each table.
 */
export const selectColumnsByIndex = createSelector(
  [(state) => state, (_, index) => index, (_, __, tableIds) => tableIds],
  (state, index, tableIds) => {
    const columnIds = tableIds.map((tableId) => {
      const columnIds = state.columns.idsByTable[tableId];
      return columnIds && index < columnIds.length ? columnIds[index] : null;
    });
    return columnIds.map((id) => selectColumnById(state, id));
  }
);

/**
 * Selects the values for the specified column IDs from the state.
 *
 * @param {Object} state - The Redux state object.
 * @param {Array<string|number>} columnIds - An array of column IDs to retrieve values for.
 * @returns {Object} An object mapping each column ID to its values array. If a column is not found, it is omitted.
 */
export const selectColumnValues = (state, columnIds) => {
  if (!columnIds || columnIds.length === 0) {
    return {};
  }
  const columnValues = {};
  columnIds.forEach((id) => {
    const column = selectColumnById(state, id);
    if (column) {
      columnValues[id] = column.values || [];
    }
  });
  return columnValues;
};
