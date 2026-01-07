/**
 * @fileoverview Redux selectors for UI interaction state.
 * @module slices/uiSlice/selectors
 *
 * Provides selectors for querying UI interaction state including
 * column selection, hovering, dragging, and focus states.
 *
 * Features:
 * - Get selected/hovered/dragged column IDs
 * - Get focused object (table or operation)
 * - Get loading operation IDs
 * - Filter selections by parent ID
 * - Get visible column IDs
 *
 * @example
 * import { selectSelectedColumnIds, selectFocusedObjectId } from './selectors';
 * const selected = selectSelectedColumnIds(state);
 */
import { createSelector } from "@reduxjs/toolkit";

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
 * This selector returns the global selection state for columns,
 * stored in `state.ui.selectedColumnIDs`. This is a global list includes columns
 * from multiple tables. Use `selectSelectedColumnIdsByParentId` to filter
 * selected columns for a specific table.
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
export const selectSelectedColumnIds = (state) => state.ui.selectedColumnIds;

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
 * const hoveredIds = selectHoveredColumnIds(state);
 * // Returns: ['c3'] (the column(s) currently under the cursor)
 */
export const selectHoveredColumnIds = (state) => state.ui.hoveredColumnIds;

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
 * const draggingIds = selectDraggingColumnIds(state);
 * // Returns: ['c4'] (or multiple IDs if dragging a selection)
 */
export const selectDraggingColumnIds = (state) => state.ui.draggingColumnIds;

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
export const selectFocusedColumnIds = (state) => state.ui.focusedColumnIds;

/**
 * Selects all drop target column IDs.
 *
 * @param {Object} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are drop targets.
 */
export const selectDropTargetColumnIds = (state) =>
  state.ui.dropTargetColumnIds;

/**
 * Selects all visible column IDs.
 *
 * @param {*} state - The Redux state.
 * @returns {Array<string>} - An array of column IDs that are currently visible.
 */
export const selectVisibleColumnIds = (state) => state.ui.visibleColumnIds;

/**
 * Selects the currently focused object from the UI slice of the Redux state,
 * specifically `state.ui.focusedObjectId`.
 *
 * @function
 * @param {Object} state - The Redux state object.
 * @returns {string|null} The currently focused object ID, e.g. table or operation
 */
export const selectFocusedObjectId = createSelector(
  (state) => state.ui.focusedObjectId,
  (focusedObjectId) => focusedObjectId
);

/**
 * Selector to determine if a specific column ID is currently hovered.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string|number} columnId - The ID of the column to check.
 * @returns {boolean} True if the column ID is hovered, false otherwise.
 */
export const isColumnIdHovered = createSelector(
  [(state) => selectHoveredColumnIds(state), (state, columnId) => columnId],
  (hoveredColumnIds, columnId) => hoveredColumnIds.includes(columnId)
);

export const isColumnIdSelected = createSelector(
  [(state) => selectSelectedColumnIds(state), (state, columnId) => columnId],
  (selectedColumnIds, columnId) => selectedColumnIds.includes(columnId)
);

export const isColumnIdDragging = createSelector(
  [(state) => selectDraggingColumnIds(state), (state, columnId) => columnId],
  (draggingColumnIds, columnId) => draggingColumnIds.includes(columnId)
);

/**
 * Selector to determine if a specific column ID is currently a drop target.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string|number} columnId - The ID of the column to check.
 * @returns {boolean|undefined} True if the column ID is a drop target, false if not,
 *                              or undefined if there are no drop targets.
 */
export const isColumnIdDropTarget = createSelector(
  [(state) => selectDropTargetColumnIds(state), (_state, columnId) => columnId],
  (dropTargetColumnIds, columnId) =>
    dropTargetColumnIds.length > 0
      ? dropTargetColumnIds.includes(columnId)
      : undefined
);

/**
 * Selector to determine if a specific column ID is currently focused.
 *
 * @function
 * @param {Object} state - The Redux state.
 * @param {string|number} columnId - The ID of the column to check.
 * @returns {boolean|undefined} True if the column ID is focused, false if not focused,
 *                              or undefined if no columns are focused.
 */
export const isColumnIdFocused = createSelector(
  [(state) => selectFocusedColumnIds(state), (state, columnId) => columnId],
  (focusedColumnIds, columnId) =>
    focusedColumnIds.length > 0
      ? focusedColumnIds.includes(columnId)
      : undefined
);

export const isColumnIdVisible = createSelector(
  [(state) => selectVisibleColumnIds(state), (state, columnId) => columnId],
  (visibleColumnIds, columnId) => visibleColumnIds.includes(columnId)
);

/**
 * Selector to retrieve the selected matches from the UI slice of the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {Array} The array of selected matches.
 */
export const selectSelectedMatches = (state) => state.ui.selectedMatches;

/**
 * Selector to retrieve the loading operations from the UI slice of the state.
 *
 * @param {Object} state - The Redux state object.
 * @returns {Array} The array of loading operation IDs.
 */
export const selectLoadingOperations = (state) => state.ui.loadingOperations;
