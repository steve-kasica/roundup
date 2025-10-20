import { createSelector } from "reselect";
import { selectOperation } from "../operationsSlice";

// =============================================================================
// Interaction-specific Column Selectors
// =============================================================================
// These selectors access column ids associated with different user interactions,
// such as selection, hovering, loading, and dragging. These selectors do not
// take a tableId argument, as they operate on global interaction state. They
// also do not need to be memoized since they are simple property accesses.

/**
 * Select all currently selected column IDs across all tables.
 *
 * This selector returns the global selection state for columns. When a user selects
 * columns in the UI (via click, shift-click, etc.), their IDs are stored in the
 * columns.selected array. This is a global list that can include columns from
 * multiple tables. Use `selectSelectedColumnIdsByTableId` to filter selected columns
 * for a specific table.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} An array of column IDs that are currently selected across
 *                          all tables. Returns an empty array if no columns are selected.
 *
 * @example
 * const selectedIds = selectSelectedColumnIds(state);
 * // Returns: ['c1', 'c5', 'c9'] (columns from potentially different tables)
 */
export const selectSelectedColumnIds = (state) => state.columns.selected;

/**
 * Select all currently hovered column ID.
 *
 * This selector returns the column ID that is currently being hovered over by the user's
 * cursor. This is used for UI feedback like highlighting or showing tooltips. The hovered
 * state is typically set by mouse enter/leave events on column components.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @returns {String} The column ID that is currently hovered.
 *                          Returns null if no columns are being hovered.
 *
 * @example
 * const hoveredId = selectHoveredColumnId(state);
 * // Returns: 'c3' (Just one column at a time)
 */
export const selectHoveredColumnId = (state) => state.columns.hovered;

/**
 * Select all column IDs that are currently in a loading state.
 *
 * This selector returns column IDs for columns that are actively loading data
 * (e.g., fetching column values, statistics, or metadata). This is used to show
 * loading spinners or disabled states in the UI while asynchronous operations
 * are in progress.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} An array of column IDs that are currently loading data.
 *                          Returns an empty array if no columns are loading.
 *
 * @example
 * const loadingIds = selectLoadingColumns(state);
 * // Returns: ['c2', 'c7'] (columns with pending async operations)
 */
export const selectLoadingColumns = (state) => state.columns.loading;

/**
 * Select all column IDs that are currently being dragged.
 *
 * This selector returns column IDs for columns that are actively being dragged
 * by the user in a drag-and-drop operation. This is used to apply visual feedback
 * like opacity changes or drag previews while the drag is in progress.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} An array of column IDs that are currently being dragged.
 *                          Returns an empty array if no drag operation is in progress.
 *
 * @example
 * const draggingIds = selectDraggingColumns(state);
 * // Returns: ['c4'] (or multiple IDs if dragging a selection)
 */
export const selectDraggingColumns = (state) => state.columns.dragging;

/**
 * Select all column IDs that currently have keyboard focus.
 *
 * This selector returns column IDs for columns that have received focus, typically
 * through keyboard navigation (Tab, arrow keys) or programmatic focus. This is used
 * to manage keyboard interaction states, apply focus styling (e.g., focus rings), and
 * ensure proper accessibility for keyboard users. Unlike selection, focus typically
 * indicates which column would respond to keyboard input.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} An array of column IDs that currently have focus.
 *                          Returns an empty array if no columns are focused.
 *
 * @example
 * const focusedIds = selectFocusedColumnIds(state);
 * // Returns: ['c5'] (typically just one column for keyboard focus)
 */
export const selectFocusedColumnIds = (state) => state.columns.focused;

/**
 * Selects all hover target column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are hover targets.
 */
export const selectHoverTargets = (state) => state.columns.hoverTargets;

/**
 * Selects all drop target column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are drop targets.
 */
export const selectDropTargets = (state) => state.columns.dropTargets;

// =============================================================================
// Table-specific Column Selectors
// =============================================================================
// These selectors access column data associated with a specific table.
// All selectors in this section take a `tableId` as an argument.

/**
 * Select ALL column IDs for a specific table, including excluded columns.
 *
 * This selector returns every column associated with a table by iterating through
 * the columns.data object, including columns that have been excluded via
 * `excludeColumnFromTable`. Unlike `selectActiveColumnIdsByTableId`, this selector
 * does not filter based on the idsByTable array. Use this when you need to access
 * metadata about all columns for a table, regardless of their active/excluded state.
 *
 * Note: The order of returned columns is not guaranteed as it depends on the
 * iteration order of the columns.data object.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get all columns for.
 * @returns {Array<string>} An array of all column IDs (both active and excluded)
 *                          associated with the table. Returns an empty array if
 *                          the table has no columns or doesn't exist.
 *
 * @example
 * // Assuming table 't1' has columns ['c1', 'c2', 'c3', 'c4'] but 'c3' is excluded
 * const allColumnIds = selectColumnIdsByTableId(state, 't1');
 * // Returns: ['c1', 'c2', 'c3', 'c4'] (includes excluded column 'c3')
 *
 * const activeColumnIds = selectActiveColumnIdsByTableId(state, 't1');
 * // Returns: ['c1', 'c2', 'c4'] (excludes 'c3')
 */
export const selectColumnIdsByTableId = createSelector(
  [(state) => state.columns.data, (_, tableId) => tableId],
  (data, tableId) =>
    Object.values(data)
      .filter((col) => col.tableId === tableId)
      .map((col) => col.id)
);

/**
 * Select active column IDs (not excluded) for a specific table.
 *
 * This selector returns only the columns that are currently included in the table's
 * idsByTable array. When columns are excluded via `excludeColumnFromTable`, they are
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
 * const activeColumnIds = selectActiveColumnIdsByTableId(state, 't1');
 * // Returns: ['c1', 'c2', 'c3']
 */
export const selectActiveColumnIdsByTableId = createSelector(
  [(state) => state.columns.idsByTable, (_, tableId) => tableId],
  (idsByTable, tableId) => idsByTable[tableId] || []
);

/**
 * Select selected (and active) column IDs for a specific table.
 *
 * This selector provides the intersection of active columns (from columns.idsByTable) and
 * selected columns (from columns.selected). It's useful for operations that should
 * only apply to columns that are both visible/active in the table AND currently
 * selected by the user. Excluded columns are automatically filtered out since they
 * won't be in the active columns list.
 *
 * The returned array maintains the same order as `selectActiveColumnIdsByTableId`,
 * preserving the column ordering defined in the table's idsByTable array.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get selected active columns for.
 * @returns {Array<string>} An array of column IDs that are both active (not excluded)
 *                          AND selected, in the same order as they appear in the table.
 *                          Returns an empty array if no columns match both criteria
 *                          or if the table doesn't exist.
 *
 * @example
 * // Assuming table 't1' has active columns ['c1', 'c2', 'c3', 'c4']
 * // and globally selected columns are ['c2', 'c4', 'c5']
 * const selectedActiveIds = selectSelectedColumnIdsByTableId(state, 't1');
 * // Returns: ['c2', 'c4'] (c5 is filtered out as it's not in this table)
 */
export const selectSelectedColumnIdsByTableId = createSelector(
  [
    (state, tableId) => selectActiveColumnIdsByTableId(state, tableId),
    selectSelectedColumnIds,
  ],
  (activeColumnIds, selected) => {
    const selectedSet = new Set(selected);
    return activeColumnIds.filter((colId) => selectedSet.has(colId));
  }
);

/**
 * Select excluded column IDs for a specific table.
 *
 * This selector returns column IDs that exist in the table's data but have been
 * excluded (removed from the idsByTable array) via `excludeColumnFromTable`. It
 * provides the inverse of `selectActiveColumnIdsByTableId` - showing which columns
 * are present in the table's data but are currently hidden from view. This is useful
 * for features like "show excluded columns" or undo operations.
 *
 * Note: The order of returned columns is not guaranteed as it depends on the
 * iteration order of `selectColumnIdsByTableId`.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get excluded columns for.
 * @returns {Array<string>} An array of column IDs that are excluded (not active) for
 *                          the table. Returns an empty array if no columns are excluded
 *                          or if the table doesn't exist.
 *
 * @example
 * // Assuming table 't1' has all columns ['c1', 'c2', 'c3', 'c4']
 * // but only ['c1', 'c2', 'c4'] are active (c3 is excluded)
 * const excludedIds = selectedExcludedColumnsByTableId(state, 't1');
 * // Returns: ['c3']
 */
export const selectedExcludedColumnsByTableId = createSelector(
  [
    (state, tableId) => selectActiveColumnIdsByTableId(state, tableId),
    (state, tableId) => selectColumnIdsByTableId(state, tableId),
  ],
  (activeColumnIds, allColumnIds) => {
    return allColumnIds.filter((colId) => !activeColumnIds.includes(colId));
  }
);

/**
 * Select database column names for selected columns in a specific table.
 *
 * This selector returns the `columnName` property (the actual database column name)
 * for columns that are selected (and also active) in the specified table.
 * This is useful when constructing database queries or performing operations that
 * require the actual column names from the database schema rather than column IDs.
 *
 * The returned array maintains the same order as `selectActiveColumnIdsByTableId`,
 * preserving the column ordering defined in the table's idsByTable array.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get selected column names for.
 * @returns {Array<string>} An array of database column names (columnName property)
 *                          for columns that are both active and selected, in the same
 *                          order as they appear in the table. Returns an empty array
 *                          if no columns match both criteria.
 *
 * @example
 * // Assuming selected active columns have columnName values 'user_id', 'email', 'created_at'
 * const dbNames = selectSelectedColumnDBNamesByTableId(state, 't1');
 * // Returns: ['user_id', 'email', 'created_at']
 */
export const selectSelectedColumnDBNamesByTableId = createSelector(
  [
    (state, tableId) => selectSelectedColumnIdsByTableId(state, tableId),
    (state) => state.columns.data,
  ],
  (selectedColumnIds, columnsData) => {
    return selectedColumnIds.map((id) => columnsData[id].columnName);
  }
);

/**
 * Select database column names for all active columns in a specific table.
 *
 * This selector returns the `columnName` property (the actual database column name)
 * for all active (not excluded) columns in the specified table. Unlike
 * `selectSelectedColumnDBNamesByTableId`, this includes ALL active columns regardless
 * of selection state. This is useful when constructing database queries or performing
 * operations that require the actual column names from the database schema rather than
 * column IDs, for all visible columns in a table.
 *
 * The returned array maintains the same order as `selectActiveColumnIdsByTableId`,
 * preserving the column ordering defined in the table's idsByTable array.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} tableId - The ID of the table to get active column names for.
 * @returns {Array<string>} An array of database column names (columnName property)
 *                          for all active columns, in the same order as they appear
 *                          in the table. Returns an empty array if the table has no
 *                          active columns or doesn't exist.
 *
 * @example
 * // Assuming table 't1' has active columns with columnName values 'id', 'user_id', 'email', 'created_at'
 * const dbNames = selectActiveColumnDBNamesByTableId(state, 't1');
 * // Returns: ['id', 'user_id', 'email', 'created_at']
 */
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

export const selectSelectedColumns = createSelector(
  [selectSelectedColumnIds, (state) => state.columns.data],
  (selectedIds, data) => {
    return selectedIds.map((id) => data[id]);
  }
);

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
 * Select a matrix of column IDs for all tables in an operation.
 *
 * This selector creates a 2D array (matrix) where each row represents a table's column IDs,
 * and each column position across rows represents columns at the same index. The matrix is
 * "backfilled" with `null` values to ensure all rows have the same length, matching the
 * longest table. This is useful for rendering columns side-by-side across multiple tables
 * in operations like joins, unions, or comparisons where column alignment matters.
 *
 * The matrix structure enables easy iteration across corresponding columns from different
 * tables, making it ideal for UI components that display columns in a grid layout.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} operationId - The ID of the operation whose child tables to get columns for.
 * @returns {Array<Array<string|null>>} A 2D array where each row is an array of column IDs
 *                                      for a table. Shorter rows are padded with `null` to
 *                                      match the length of the longest row. Returns an empty
 *                                      matrix if the operation has no children.
 *
 * @example
 * // Assuming operation 'op1' has two child tables:
 * // - Table 't1' with columns ['c1', 'c2', 'c3']
 * // - Table 't2' with columns ['c4', 'c5']
 * const matrix = selectColumnIdMatrixByOperationId(state, 'op1');
 * // Returns:
 * // [
 * //   ['c1', 'c2', 'c3'],
 * //   ['c4', 'c5', null]  // Padded with null to match length
 * // ]
 */
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
