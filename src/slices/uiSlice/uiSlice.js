/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";
import { normalizeInputToArray } from "../utilities";

export const initialState = {
  // UI interactions on columns
  hoveredColumnIds: [], // array of column ids
  selectedColumnIds: [], // array of column ids
  focusedColumnIds: [], // array of column ids
  visibleColumnIds: [], // array of column ids
  draggingColumnIds: [], // array of column ids
  dropTargetColumnIds: [], // array of column ids
  focusedObject: null, // either a table id or sucessfully created operation id
  selectedMatches: [], // array of match types
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Sets the selected column IDs in the state.
     *
     * @param {Object} state - The current Redux state slice for UI.
     * @param {Object} action - The Redux action object.
     * @param {Array|string|number} action.payload - The column IDs to select, can be a single value or an array.
     */
    setSelectedColumnIds(state, action) {
      const columnIds = normalizeInputToArray(action.payload);
      state.selectedColumnIds = columnIds;
    },

    /**
     * Sets the list of currently hovered column IDs in the UI state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - The column ID or array of column IDs to set as hovered.
     */
    setHoveredColumnIds(state, action) {
      const columnIds = normalizeInputToArray(action.payload);
      state.hoveredColumnIds = columnIds;
    },

    /**
     * Adds column IDs to the list of currently hovered column IDs in the UI state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - The column ID or array of column IDs to add to hovered.
     */
    addToHoveredColumnIds(state, action) {
      const columnIdsToAdd = normalizeInputToArray(action.payload);
      columnIdsToAdd.forEach((id) => {
        if (!state.hoveredColumnIds.includes(id)) {
          state.hoveredColumnIds.push(id);
        }
      });
    },

    /**
     * Removes column IDs from the list of currently hovered column IDs in the UI state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - The column ID or array of column IDs to remove from hovered.
     */
    removeFromHoveredColumnIds(state, action) {
      const columnIdsToRemove = normalizeInputToArray(action.payload);
      state.hoveredColumnIds = state.hoveredColumnIds.filter(
        (id) => !columnIdsToRemove.includes(id)
      );
    },

    /**
     * Sets the focused column IDs in the UI state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {any} action.payload - The payload containing column IDs, which can be a single value or an array.
     */
    setFocusedColumnIds(state, action) {
      const columnIds = normalizeInputToArray(action.payload);
      state.focusedColumnIds = columnIds;
    },

    /**
     * Sets the list of visible column IDs in the UI state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {string[]|string} action.payload - The column IDs to set as visible. Can be a single string or an array of strings.
     */
    setVisibleColumnIds(state, action) {
      const columnIds = normalizeInputToArray(action.payload);
      state.visibleColumnIds = columnIds;
    },

    /**
     * Sets the list of currently dragging column IDs in the UI state.
     *
     * Normalizes the input payload to an array and updates the `draggingColumnIds` property in the state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|string[]} action.payload - The column ID or array of column IDs being dragged.
     */
    setDraggingColumnIds(state, action) {
      const columnIds = normalizeInputToArray(action.payload);
      state.draggingColumnIds = columnIds;
    },

    /**
     * Sets the drop target column IDs in the UI state.
     *
     * Normalizes the provided payload to an array and updates the `dropTargetColumnIds` property in the state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {*} action.payload - The payload containing column IDs to set as drop targets. Can be a single value or an array.
     */
    setDropTargetColumnIds(state, action) {
      const columnIds = normalizeInputToArray(action.payload);
      state.dropTargetColumnIds = columnIds;
    },

    /**
     * Updates the selectedMatches state with the provided payload.
     *
     * @function
     * @param {Object} state - The current state of the UI slice.
     * @param {Object} action - The Redux action containing the payload.
     * @param {Array} action.payload - The new array of selected matches to set in the state.
     */
    setSelectedMatches(state, action) {
      const selectedMatches = normalizeInputToArray(action.payload);
      state.selectedMatches = selectedMatches;
    },

    /**
     * Sets the currently focused object in the UI state.
     *
     * @param {Object} state - The current UI slice state.
     * @param {Object} action - The Redux action object.
     * @param {*} action.payload - The object to set as focused.
     */
    setFocusedObject(state, action) {
      state.focusedObject = action.payload;
    },
  },
});

// Action
export const {
  setSelectedColumnIds,
  setHoveredColumnIds,
  addToHoveredColumnIds,
  removeFromHoveredColumnIds,
  setFocusedColumnIds,
  setVisibleColumnIds,
  setDraggingColumnIds,
  setDropTargetColumnIds,
  setFocusedObject,
  setSelectedMatches,
} = uiSlice.actions;

export default uiSlice.reducer;
