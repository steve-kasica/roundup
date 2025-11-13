import { createSelector } from "reselect";
import { selectSelectedColumnIds } from "../uiSlice";
import {
  isTableId,
  selectTableColumnIds,
  selectTablesById,
} from "../tablesSlice";
import { selectOperationsById } from "../operationsSlice";

/**
 * Select ALL column IDs for a specific table, including excluded columns.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} parentId - The ID of the table/operation to get all columns for.
 * @returns {Array<string>} An array of all column IDs (both active and excluded) associated with the table. Returns an empty array if the table has no columns or doesn't exist.
 */
export const selectColumnIdsByParentId = createSelector(
  [(state) => state.columns.byId, (_, parentId) => parentId],
  (byId, parentId) =>
    Object.values(byId)
      .filter((col) => col.parentId === parentId)
      .map((col) => col.id)
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
 * Select selected (and active) column IDs for a specific table.
 *
 * This selector provides the intersection of active columns (from columns.idsByTable) and selected columns (from columns.selected). It's useful for operations that should only apply to columns that are both visible/active in the table AND currently selected by the user. Excluded columns are automatically filtered out since they won't be in the active columns list.
 *
 * The returned array maintains the same order as `selectTableColumnIds`,
 * preserving the column ordering defined in the table's `childIds` array.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string} parentId - The ID of the table to get selected active columns for.
 * @returns {Array<string>} An array of column IDs that are both active (not excluded) AND selected, in the same order as they appear in the table. Returns an empty array if no columns match both criteria or if the table doesn't exist.
 *
 */
export const selectSelectedColumnIdsByParentId = createSelector(
  [
    (state, parentId) =>
      isTableId(parentId)
        ? selectTablesById(state, parentId).columnIds
        : selectOperationsById(state, parentId).columnIds,
    (state) => selectSelectedColumnIds(state),
  ],
  (activeColumnIds, selectedColumnIds) => {
    const selectedSet = new Set(selectedColumnIds);
    return activeColumnIds.filter((colId) => selectedSet.has(colId));
  }
);
