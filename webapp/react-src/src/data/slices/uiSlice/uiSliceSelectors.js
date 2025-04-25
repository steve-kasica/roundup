/**
 * Selects the entire hovered state.
 * @param {Object} state - The global Redux state.
 * @returns {Object} The hovered state.
 */
export const selectHovered = (state) => state.ui.hovered;

/**
 * Selects the hovered table ID.
 * @param {Object} state - The global Redux state.
 * @returns {string|null} The hovered table ID.
 */
export const selectHoveredTableId = (state) => state.ui.hovered.tableId;

/**
 * Selects the hovered operation ID.
 * @param {Object} state - The global Redux state.
 * @returns {string|null} The hovered operation ID.
 */
export const selectHoveredOperationId = (state) => state.ui.hovered.operationId;

/**
 * Selects the hovered column index.
 * @param {Object} state - The global Redux state.
 * @returns {number|null} The hovered column index.
 */
export const selectHoveredColumnIndex = (state) => state.ui.hovered.columnIndex;

/**
 * Selects the hovered column ID.
 * @param {Object} state - The global Redux state.
 * @returns {string|null} The hovered column ID.
 */
export const selectHoveredColumnId = (state) => state.ui.hovered.columnId;

/**
 * Selects the entire selected state.
 * @param {Object} state - The global Redux state.
 * @returns {Object} The selected state.
 */
export const selectSelected = (state) => state.ui.selected;

/**
 * Selects the selected operation ID.
 * @param {Object} state - The global Redux state.
 * @returns {string|null} The selected operation ID.
 */
export const selectSelectedOperationId = (state) =>
  state.ui.selected.operationId;

/**
 * Selects the selected column IDs.
 * @param {Object} state - The global Redux state.
 * @returns {string[]} The selected column IDs.
 */
export const selectSelectedColumnIds = (state) => state.ui.selected.columnIds;

/**
 * Selects the selected table IDs.
 * @param {Object} state - The global Redux state.
 * @returns {string[]} The selected table IDs.
 */
export const selectSelectedTableIds = (state) => state.ui.selected.tableIds;

/**
 * Selects the column ID that is currently being dragged.
 * @param {Object} state - The Redux state.
 * @returns {string|null} The ID of the column being dragged, or `null` if none.
 */
export const selectDraggedSrcColumnId = (state) => state.ui.dragged.srcColumnId;

/**
 * Selects the column ID that is currently being dragged.
 * @param {Object} state - The Redux state.
 * @returns {string|null} The ID of the column being dragged, or `null` if none.
 */
export const selectDraggedTargetColumnId = (state) =>
  state.ui.dragged.targetColumnId;
