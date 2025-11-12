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
 * This selector returns the global selection state for columns. When a user selects
 * columns in the UI (via click, shift-click, etc.), their IDs are stored in the
 * columns.selected array. This is a global list that can include columns from
 * multiple tables. Use `selectSelectedColumnIdsByParentId` to filter selected columns
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
 * Selects the currently focused object from the UI slice of the Redux state.
 *
 * @function
 * @param {Object} state - The Redux state object.
 * @returns {*} The currently focused object from the UI state.
 */
export const selectFocusedObject = (state) => state.ui.focusedObject;

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

export const isColumnIdDropTarget = createSelector(
  [(state) => selectDropTargetColumnIds(state), (state, columnId) => columnId],
  (dropTargetColumnIds, columnId) => dropTargetColumnIds.includes(columnId)
);

export const isColumnIdFocused = createSelector(
  [(state) => selectFocusedColumnIds(state), (state, columnId) => columnId],
  (focusedColumnIds, columnId) => focusedColumnIds.includes(columnId)
);

export const isColumnIdVisible = createSelector(
  [(state) => selectVisibleColumnIds(state), (state, columnId) => columnId],
  (visibleColumnIds, columnId) => visibleColumnIds.includes(columnId)
);

export const selectColumnIndexById = createSelector(
  [
    (state, columnId, parentId) => state.columns.byParentId[parentId],
    (state, columnId) => columnId,
  ],
  (tableColumns, columnId) => tableColumns.indexOf(columnId)
);

export const selectSelectedMatches = (state) => state.ui.selectedMatches;
