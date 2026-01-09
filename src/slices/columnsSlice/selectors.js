/**
 * @fileoverview Redux selectors for column state.
 * @module slices/columnsSlice/selectors
 *
 * Provides memoized selectors for querying column state including
 * filtering by parent, getting column details, and cross-referencing
 * with UI selection state.
 *
 * Features:
 * - Select columns by ID or parent ID
 * - Get column database names for queries
 * - Filter active vs hidden columns
 * - Get selected columns by parent
 * - Find column index within parent
 *
 * @example
 * import { selectColumnsById, selectColumnIdsByParentId } from './selectors';
 * const column = selectColumnsById(state, 'col_1');
 */
import { createSelector } from "reselect";
import { selectSelectedColumnIds } from "../uiSlice";
import { isTableId, selectTablesById } from "../tablesSlice";
import { selectOperationsById } from "../operationsSlice";

/**
 * Select ALL column IDs for a specific `parentId`, by iterating over the entire set of columns in Redux.
 * TODO: should table schema and stack schema should have just been using a different selector? Check how
 * this selector is used in the app.
 *
 * @param {Object} state - The Redux state.
 * @param {string|string[]} parentId - The ID(s) of the table/operation to get all columns for.
 * @returns {Array<string>|Array<Array<string>>} An array of all column IDs (both active and hided) associated with the table. If parentId is an array, returns an array of arrays. Returns an empty array if the table has no columns or doesn't exist.
 * @type {import('@reduxjs/toolkit').Selector<any, string|string[], Array<string>|Array<Array<string>>>}
 */
export const selectColumnIdsByParentId = createSelector(
  [
    (state) => state.tables.byId,
    (state) => state.operations.byId,
    (_, parentIds) => parentIds,
  ],
  (tablesById, operationsById, parentIds) => {
    const getColumnIds = (id) =>
      (isTableId(id)
        ? selectTablesById({ tables: { byId: tablesById } }, id)?.columnIds
        : selectOperationsById({ operations: { byId: operationsById } }, id)
            ?.columnIds) || [];

    if (Array.isArray(parentIds)) {
      return parentIds.map(getColumnIds);
    }
    return getColumnIds(parentIds);
  }
);

/**
 * Selects a specific column by its ID.
 *
 * @param {Object} state - The Redux state.
 * @param {string} columnId - The ID of the column.
 * @returns {Object|null} - The column object or null if not found.
 */
export const selectColumnsById = createSelector(
  [(state) => state.columns.byId, (_, ids) => ids],
  (byId, ids) => (Array.isArray(ids) ? ids.map((id) => byId[id]) : byId[ids])
);

/**
 * Select column names for given column ID(s).
 *
 * This selector retrieves the `databaseName` property (the actual database
 * column name) for one or more specified column IDs. It can handle both
 * single ID strings and arrays of IDs, returning either a single column name
 * or an array of names accordingly. This is useful when you need to map from
 * internal column IDs to their corresponding database names for
 * query construction or display.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string|string[]} ids - A single column ID or an array of column IDs.
 * @returns {string|string[]} The database column name(s) corresponding to
 *                            the provided ID(s).
 *                            Returns null for any ID that does not exist.
 */
export const selectColumnNamesById = createSelector(
  [(state) => state.columns.byId, (_, ids) => ids],
  (byId, ids) =>
    !ids
      ? null
      : Array.isArray(ids)
      ? ids.map((id) => byId[id]?.databaseName)
      : byId[ids]?.databaseName
);

/**
 * Select selected column IDs for specific tables.
 * This selector provides the intersection of active columns (from `state.columns.idsByTable`) and
 * selected columns (from `state.ui.selectedColumnIds`). It's useful for operations that should
 * only apply to columns that are both visible/active in the table AND currently selected
 * by the user. Excluded columns are automatically filtered out
 * since they won't be in the active columns list.
 *
 * The returned array maintains the same order as `selectTableColumnIds`,
 * preserving the column ordering defined in the table's `childIds` array.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} parentId - The ID of the table to get selected active columns for.
 * @returns {Array<string>} An array of column IDs that are both active (not hided) AND selected, in the same order as they appear in the table. Returns an empty array if no columns match both criteria or if the table doesn't exist.
 *
 */
export const selectSelectedColumnIdsByParentId = createSelector(
  [
    (state, parentIds) => parentIds,
    (state) => state.tables.byId,
    (state) => state.operations.byId,
    (state) => selectSelectedColumnIds(state),
  ],
  (parentIds, tablesById, operationsById, selectedColumnIds) => {
    const selectedSet = new Set(selectedColumnIds);
    const normalizedParentIds = Array.isArray(parentIds)
      ? parentIds
      : [parentIds];

    const output = normalizedParentIds.map((parentId) => {
      const columnIds = isTableId(parentId)
        ? tablesById[parentId].columnIds
        : operationsById[parentId].columnIds;
      return columnIds.filter((colId) => selectedSet.has(colId));
    });

    return output.length === 1 ? output[0] : output;
  }
);

export const selectActiveColumnIdsByParentId = createSelector(
  [
    (state) => state.tables.byId,
    (state) => state.operations.byId,
    (state, parentIds) => parentIds,
  ],
  (tablesById, operationsById, parentIds) => {
    if (Array.isArray(parentIds)) {
      const columnIds = parentIds.map(
        (id) => (isTableId(id) ? tablesById : operationsById)[id].columnIds
      );
      return columnIds;
    } else {
      return (isTableId(parentIds) ? tablesById : operationsById)[parentIds]
        .columnIds;
    }
  }
);

export const selectColumnIndexById = createSelector(
  [
    (state, columnId) => state.columns.byId[columnId].parentId,
    (state) => state.tables.byId,
    (state) => state.operations.byId,
    (state, columnId) => columnId,
  ],
  (parentId, tablesById, operationsById, columnId) => {
    const parent = isTableId(parentId)
      ? tablesById[parentId]
      : operationsById[parentId];
    return parent.columnIds.indexOf(columnId);
  }
);

export const selectOrphanedColumnIds = createSelector(
  [
    (state) => state.columns.byId,
    (state) => state.tables.byId,
    (state) => state.operations.byId,
    (_state, parentId) => parentId,
  ],
  (columnsById, tablesById, operationsById, parentId) => {
    let currentColumnIds = isTableId(parentId)
      ? selectTablesById({ tables: { byId: tablesById } }, parentId)?.columnIds
      : selectOperationsById({ operations: { byId: operationsById } }, parentId)
          ?.columnIds;
    const allColumnIds = Object.values(columnsById)
      .filter((col) => col.parentId === parentId)
      .map((col) => col.id);
    const orphanedColumnIds = allColumnIds.filter(
      (id) => !currentColumnIds.includes(id)
    );
    return orphanedColumnIds;
  }
);
