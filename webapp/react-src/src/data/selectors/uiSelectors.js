/**
 * Selectors that are used to get UI data,
 * from the `ui` slice in the Redux store
 */
import { initialState } from "../uiSlice";

export const getFocusedColumnId = ({ ui }) => ui.focused.column;

/**
 * Retrieves the ID of the currently focused operation
 *
 * @param {Object} state - The Redux state object
 * @returns {string|null} The ID of the currently focused operation
 */
export const getFocusedOperationId = ({ ui }) => ui.focused.operation;

/**
 * Retrieves the index of the column currently being hovered over
 *
 * @param {Object} state - The Redux state object
 * @returns {number|null} The index of the column being hovered over
 */
export const getHoverColumnIndex = (state) => state.ui.hover.columnIndex;

export const getHoverOperationId = ({ ui }) => ui.hover.operation;

/**
 * Retrieves the ID of the table currently being hovered over
 *
 * @param {Object} state - The Redux state object
 * @returns {string|null} The ID of the table being hovered over
 */
export const getHoverTableId = (state) => state.ui.hover.table;

/**
 * Retrieves the complete focus state object from the UI slice
 *
 * @param {Object} state - The Redux state object with destructured UI property
 * @param {Object} state.ui - The UI slice of the Redux state
 * @returns {Object} The current focus state object
 */
export const getFocused = ({ ui }) => ui.focused;

export function getHoverColumnId(state) {
  return state.ui.hover.columnId;
}
