import { initialState } from "../uiSlice";

/**
 * Retrieves the complete focus state object from the UI slice
 * 
 * @param {Object} state - The Redux state object with destructured UI property
 * @param {Object} state.ui - The UI slice of the Redux state
 * @returns {Object} The current focus state object
 */
export const getFocused = ({ui}) => ui.focused;

/**
 * Retrieves the ID of the currently focused operation
 * 
 * @param {Object} state - The Redux state object
 * @returns {string|null} The ID of the currently focused operation
 */
export const getFocusedOperationId = (state) => state.ui.focused.operation;

/**
 * Retrieves the ID of the table currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @returns {string|null} The ID of the table being hovered over
 */
export const getHoverTable = (state) => state.ui.hover.table;

/**
 * Retrieves the index of the column currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @returns {number|null} The index of the column being hovered over
 */
export const getHoverColumnIndex = (state) => state.ui.hover.columnIndex;

/**
 * Determines whether the specified column is currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @param {Object} column - The column object to check
 * @param {string} column.tableId - The ID of the table this column belongs to
 * @param {number} column.index - The index of the column within its table
 * @returns {boolean} True if the column is being hovered over, false otherwise
 */
export const isColumnHover = (state, column) => {
    const hoverTable = getHoverTable(state);
    const isTableMatch = isTableHover(state, column.tableId);
    const hoverColumnIndex = getHoverColumnIndex(state);
    return (
        (isTableMatch && (hoverColumnIndex === column.index || hoverColumnIndex === initialState.hover.columnIndex)) ||
        (hoverColumnIndex === column.index && hoverTable === initialState.hover.table)
    );    
}

/**
 * Determines whether the specified table is currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @param {string} tableId - The ID of the table to check
 * @returns {boolean} True if the table is being hovered over, false otherwise
 */
export const isTableHover = (state, tableId) => (getHoverTable(state) === tableId);