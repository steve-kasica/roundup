/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const initialState = {
  // interaction states
  hovered: {
    tableId: null,
    operationId: null,
    columnIndex: null,
    columnId: null,
  },
  selected: {
    operationId: null,
    columnIds: [],
    tableIds: [],
  },
  dragged: {
    srcColumnId: null, // Tracks the column ID being dragged
    targetColumnId: null, // Tracks the column ID being hovered over
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Sets the hovered table ID.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|null} action.payload - The ID of the table to set as hovered.
     */
    setHoverTableId(state, action) {
      state.hovered.tableId = action.payload;
    },

    /**
     * Sets the hovered operation ID.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|null} action.payload - The ID of the operation to set as hovered.
     */
    setHoverOperationId(state, action) {
      state.hovered.operationId = action.payload;
    },

    /**
     * Sets the hovered column index.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {number|null} action.payload - The index of the column to set as hovered.
     */
    setHoverColumnIndex(state, action) {
      state.hovered.columnIndex = action.payload;
    },

    /**
     * Sets the hovered column ID.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|null} action.payload - The ID of the column to set as hovered.
     */
    setHoverColumnId(state, action) {
      state.hovered.columnId = action.payload;
    },

    /**
     * Resets the hovered table ID to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetHoverTableId(state) {
      state.hovered.tableId = initialState.hovered.tableId;
    },

    /**
     * Resets the hovered operation ID to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetHoverOperationId(state) {
      state.hovered.operationId = initialState.hovered.operationId;
    },

    /**
     * Resets the hovered column index to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetHoverColumnIndex(state) {
      state.hovered.columnIndex = initialState.hovered.columnIndex;
    },

    /**
     * Resets the hovered column ID to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetHoverColumnId(state) {
      state.hovered.columnId = initialState.hovered.columnId;
    },

    /**
     * Sets the selected operation ID.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|null} action.payload - The ID of the operation to set as selected.
     */
    setSelectedOperationId(state, action) {
      state.selected.operationId = action.payload;
    },

    /**
     * Appends one or more column IDs to the selected column IDs.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|string[]} action.payload - The column ID(s) to append.
     */
    addToSelectedColumnIds(state, { payload }) {
      if (Array.isArray(payload)) {
        state.selected.columnIds = [...state.selected.columnIds, ...payload];
      } else {
        state.selected.columnIds.push(payload);
      }
    },

    /**
     * Appends one or more table IDs to the selected table IDs.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|string[]} action.payload - The table ID(s) to append.
     */
    addToSelectedTableIds(state, { payload }) {
      if (Array.isArray(payload)) {
        state.selected.tableIds = [...state.selected.tableIds, ...payload];
      } else {
        state.selected.tableIds.push(payload);
      }
    },

    /**
     * Resets the selected operation ID to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetSelectedOperationId(state) {
      state.selected.operationId = initialState.selected.operationId;
    },

    /**
     * Removes one or more column IDs from the selected column IDs.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|string[]} action.payload - The column ID(s) to remove.
     */
    removeFromSelectedColumnIds(state, { payload }) {
      let columnIdsToUnselect = Array.isArray(payload) ? payload : [payload];
      state.selected.columnIds = state.selected.columnIds.filter(
        (columnId) => !columnIdsToUnselect.includes(columnId)
      );
    },

    /**
     * Toggles the selection state of one or more column IDs.
     * If a column ID is already selected, it will be removed from the selection.
     * If it is not selected, it will be added to the selection.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|string[]} action.payload - The column ID(s) to toggle.
     * @returns
     */
    toggleSelectedColumnIds(state, { payload }) {
      const columnIdsToToggle = Array.isArray(payload) ? payload : [payload];
      const currentSelection = new Set(state.selected.columnIds);

      columnIdsToToggle.forEach((columnId) => {
        if (currentSelection.has(columnId)) {
          currentSelection.delete(columnId); // Remove if already selected
        } else {
          currentSelection.add(columnId); // Add if not selected
        }
      });

      state.selected.columnIds = Array.from(currentSelection);
    },

    /**
     * Removes one or more table IDs from the selected table IDs.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|string[]} action.payload - The table ID(s) to remove.
     */
    removeFromSelectedTableIds(state, { payload }) {
      let tableIdsToUnselect = Array.isArray(payload) ? payload : [payload];
      state.selected.tableIds = state.selected.tableIds.filter(
        (tableId) => !tableIdsToUnselect.includes(tableId)
      );
    },

    /**
     * Clears all selected column IDs, resetting them to their initial state.
     * @param {Object} state - The current state of the slice.
     */
    clearSelectedColumnIds(state) {
      state.selected.columnIds = initialState.selected.columnIds;
    },

    /**
     * Clears all selected table IDs, resetting them to their initial state.
     * @param {Object} state - The current state of the slice.
     */
    clearSelectedTableIds(state) {
      state.selected.tableIds = initialState.selected.tableIds;
    },

    /**
     * Sets the column ID that is being dragged.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|null} action.payload - The ID of the column being dragged.
     */
    setDraggedSrcColumnId(state, action) {
      state.dragged.srcColumnId = action.payload;
    },

    /**
     * Resets the drag column ID to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetDraggedSrcColumnId(state) {
      state.dragged.srcColumnId = initialState.dragged.srcColumnId;
    },
    /**
     * Sets the column ID that is being dragged.
     * @param {Object} state - The current state of the slice.
     * @param {Object} action - The dispatched action.
     * @param {string|null} action.payload - The ID of the column being dragged.
     */
    setDraggedTargetColumnId(state, action) {
      state.dragged.targetColumnId = action.payload;
    },

    /**
     * Resets the drag column ID to its initial state.
     * @param {Object} state - The current state of the slice.
     */
    unsetDraggedTargetColumnId(state) {
      state.dragged.targetColumnId = initialState.dragged.targetColumnId;
    },
  },
});

// Action
export const {
  setHoverTableId,
  setHoverOperationId,
  setHoverColumnIndex,
  setHoverColumnId,
  unsetHoverTableId,
  unsetHoverOperationId,
  unsetHoverColumnIndex,
  unsetHoverColumnId,
  setSelectedOperationId,
  addToSelectedColumnIds,
  addToSelectedTableIds,
  unsetSelectedOperationId,
  toggleSelectedColumnIds,
  removeFromSelectedColumnIds,
  removeFromSelectedTableIds,
  clearSelectedColumnIds,
  clearSelectedTableIds,
  setDraggedSrcColumnId,
  unsetDraggedSrcColumnId,
  setDraggedTargetColumnId,
  unsetDraggedTargetColumnId,
} = uiSlice.actions;

export default uiSlice.reducer;
