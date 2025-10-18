import { createSelector } from "reselect";
import { selectOperation } from "../operationsSlice";

/**
 * Selects all column IDs for a specific table,
 * including columns that have been excluded, i.e.
 * not present in idsByTable.
 */
export const selectColumnIdsByTableId = createSelector(
  [(state) => state.columns.data, (_, tableId) => tableId],
  (data, tableId) =>
    Object.values(data)
      .filter((col) => col.tableId === tableId)
      .map((col) => col.id)
);

/**
 * Select column IDs for a specific table that are active (not excluded).
 */
export const selectActiveColumnIdsByTableId = createSelector(
  [(state) => state.columns.idsByTable, (_, tableId) => tableId],
  (idsByTable, tableId) => idsByTable[tableId] || []
);

export const selectSelectedColumnIdsByTableId = createSelector(
  [
    (state, tableId) => selectActiveColumnIdsByTableId(state, tableId),
    (state) => state.columns.selected,
  ],
  (activeColumnIds, selected) => {
    const selectedSet = new Set(selected);
    return activeColumnIds.filter((colId) => selectedSet.has(colId));
  }
);

/**
 * Selects column data objects for a specific table.
 * Only recomputes when the actual column data changes, not other columns slice properties.
 */
const selectColumnDataByTableId = createSelector(
  [
    (state) => state.columns.data,
    (state, tableId) => selectColumnIdsByTableId(state, tableId),
  ],
  (allColumnsData, columnIds) => {
    return columnIds.map((id) => allColumnsData[id]);
  }
);

export const selectSelectedColumnDBNamesByTableId = createSelector(
  [selectColumnDataByTableId, (state) => state.columns.selected],
  (columns, selected) => {
    const selectedSet = new Set(selected);
    return columns
      .filter((column) => column && selectedSet.has(column.id))
      .map((column) => column.columnName);
  }
);

export const selectActiveColumnDBNamesByTableId = createSelector(
  [
    (state, TableId) => selectActiveColumnIdsByTableId(state, TableId),
    (state) => state.columns.data,
  ],
  (activeColumnIds, data) => {
    return activeColumnIds.map((id) => data[id].columnName);
  }
);

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
export const selectSelectedColumnIds = createSelector(
  [(state) => state.columns.selected],
  (selected) => selected
);

export const selectSelectedColumns = createSelector(
  [selectSelectedColumnIds, (state) => state.columns.data],
  (selectedIds, data) => {
    return selectedIds.map((id) => data[id]);
  }
);

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

/**
 * Selector that retrieves an array of table IDs corresponding to the given array of column IDs.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {Array<string>} columnIds - An array of column IDs to look up.
 * @returns {Array<string|undefined>} An array of table IDs associated with the provided column IDs. If a column is not found, its entry will be undefined.
 */
export const selectTableIdsByColumnIds = createSelector(
  [(state) => state.columns.data, (_, columnIds) => columnIds],
  (data, columnIds) => columnIds.map((columnId) => data[columnId].tableId)
);

export const selectRemovedColumnIdsByTableId = createSelector(
  [
    (state, tableId) => state.columns.idsByTable[tableId] || [],
    (state) => state.columns.dropped,
  ],
  (columnIds, droppedColumnIds) => {
    return columnIds.filter((columnId) => droppedColumnIds.includes(columnId));
  }
);

/**
 * Give the total number of columns associated with this table, excluding removed columns.
 */
export const selectActiveColumnCountByTableId = createSelector(
  [
    (state, tableId) => state.columns.idsByTable[tableId] || [],
    (state, tableId) => selectRemovedColumnIdsByTableId(state, tableId),
  ],
  (columnIds, removedColumnIds) => {
    return columnIds.filter((id) => !removedColumnIds.includes(id)).length;
  }
);

/**
 * Selects whether a column is a valid drop target.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column to check.
 * @returns {boolean} - True if the column is a valid drop target.
 */
export const selectIsColumnDropTarget = createSelector(
  [(state) => state.columns.dropTargets, (_, columnId) => columnId],
  (dropTargets, columnId) => dropTargets.includes(columnId)
);

/**
 * Selects all drop target column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are drop targets.
 */
export const selectDropTargets = (state) => state.columns.dropTargets;

/**
 * Selects whether a column is currently being hovered over during drag.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column to check.
 * @returns {boolean} - True if the column is being hovered over.
 */
export const selectIsColumnHoverTarget = createSelector(
  [(state) => state.columns.hoverTargets, (_, columnId) => columnId],
  (hoverTargets, columnId) => hoverTargets.includes(columnId)
);

/**
 * Selects all hover target column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are hover targets.
 */
export const selectHoverTargets = (state) => state.columns.hoverTargets;

export const selectColumnIdMatrixByOperationId = createSelector(
  [
    (state, operationId) => selectOperation(state, operationId).children,
    (state) => state.columns.idsByTable,
  ],
  (children, idsByTable) => {
    const matrix = children.map((childId) => idsByTable[childId] || []);
    const maxLength = Math.max(...matrix.map((row) => row.length), 0);
    const backfilledMatrix = matrix.map((row) => {
      if (row.length < maxLength) {
        return [...row, ...Array(maxLength - row.length).fill(null)];
      }
      return row;
    });
    return backfilledMatrix;
  }
);

export const selectFocusedColumnIds = (state) => state.columns.focused;
