import { createSelector } from "reselect";

/**
 * Selects all column IDs for a specific table.
 *
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table.
 * @returns {Array<string>} - An array of column IDs for the table.
 */
export function selectColumnIdsByTableId(state, tableId) {
  return state.columns.idsByTable[tableId];
}

/**
 * Selects a specific column by its ID.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column.
 * @returns {Object|null} - The column object or null if not found.
 */
export function selectColumnById(state, id) {
  const column = state.columns.data[id];
  return column;
}

/**
 * Selects the loading status of a specific column.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column.
 * @returns {boolean} - True if the column is loading, false otherwise.
 */
export function selectColumnLoadingStatus(state, columnId) {
  const column = selectColumnById(state, columnId);
  return column ? column.loading : false;
}

/**
 * Selects all columns for a specific table.
 *
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table.
 * @returns {Array<Object>} - An array of column objects for the table.
 */
export const selectColumnsByTable = (state, tableId) => {
  const columnIds = selectColumnIdsByTableId(state, tableId);
  return columnIds.map((id) => selectColumnById(state, id));
};

/**
 * Selects the error message of a specific column.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column.
 * @returns {string|null} - The error message or null if no error.
 */
export const selectColumnError = (state, columnId) => {
  const column = selectColumnById(state, columnId);
  return column ? column.error : null;
};

/**
 * Selects all columns that are currently loading for a specific table.
 *
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table.
 * @returns {Array<Object>} - An array of columns that are loading.
 */
export const selectLoadingColumnsByTable = (state, tableId) => {
  const columns = selectColumnsByTable(state, tableId);
  return columns.filter((column) => column.loading);
};

/**
 * Selects all columns across tables at a specific index.
 *
 * @param {Object} state - The Redux state.
 * @param {number} index - The index of the columns to select.
 * @returns {Array<string|null>} - An array of column IDs at the specified index across all tables.
 */
export const selectColumnIdsByIndex = createSelector(
  [
    (state) => state.columns.idsByTable,
    (_, index) => index,
    (_, __, tableIds) => tableIds,
  ],
  (idsByTable, index, tableIds) => {
    return tableIds.map((tableId) => {
      const columnIds = idsByTable[tableId];
      return columnIds && index < columnIds.length ? columnIds[index] : null;
    });
  }
);

/**
 * Selects the selected column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs where `status.isSelected` is true
 */
export const selectSelectedColumnIds = (state) => state.columns.selected;

export function selectColumnCountByTableId(state, tableId) {
  const columnIds = selectColumnIdsByTableId(state, tableId);
  return columnIds.length;
}
