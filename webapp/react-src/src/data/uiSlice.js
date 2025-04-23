/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const SIDEBAR_CLOSED = "closed";

export const SIDEBAR_DATA_SOURCES = 1;
export const SIDEBAR_SOURCE_TABLES = 2;
export const SIDEBAR_SOURCE_COLUMNS = 3;
export const SIDEBAR_ISSUES = 4;
export const SIDEBAR_EXPORT = 5;

export const SIDEBAR_CONFIG = "config";

export const DRAWER_CLOSED = "closed";
export const DRAWER_SOURCE_COLUMNS = "source columns";

// Enumerate valid options for `insertionMode` property
export const ADD_TO_GROUP = "add";
export const SYSTEM_DECIDES = "system";

export const STAGE_CONFIG_SOURCES = "cs";
export const STAGE_ARRANGE_TABLES = "at";
export const STAGE_REFINE_OPS = "ro";
export const STAGE_EXPORT = "e";

const STAGES = [
  STAGE_CONFIG_SOURCES,
  STAGE_ARRANGE_TABLES,
  STAGE_REFINE_OPS,
  STAGE_EXPORT,
];

export const initialState = {
  workflow: null,
  sidebarStatus: SIDEBAR_DATA_SOURCES,
  insertionMode: SYSTEM_DECIDES,
  focusedNode: null,
  stage: STAGE_ARRANGE_TABLES,
  searchString: "",
  firstPaneWidth: 20,
  hoverOperation: null,
  selectedOperation: null,

  // interaction states
  focused: {
    operation: null,
    columns: [],
  },
  hover: {
    table: null,
    operation: null,
    columnIndex: null,
    columnId: null,
  },
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    /**
     * Sets the current workflow
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {Object} action.payload - The workflow object to set
     */
    setWorkflow: (state, action) => {
      state.workflow = action.payload;
    },

    /**
     * Updates the sidebar status
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string|boolean} action.payload - The new sidebar status
     */
    setSidebarStatus: (state, action) => {
      state.sidebarStatus = action.payload;
    },

    /**
     * Sets the current insertion mode
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The insertion mode to set
     */
    setInsertionMode: (state, action) => {
      state.insertionMode = action.payload;
    },

    /**
     * Updates the currently focused node
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string|null} action.payload - The ID of the node to focus
     */
    setFocusedNode: (state, action) => {
      state.focusedNode = action.payload;
    },

    /**
     * Sets the current application stage
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The stage to set (validated against STAGES)
     */
    setStage: (state, action) => {
      checkPayload(action.payload, STAGES);
      state.stage = action.payload;
    },

    /**
     * Updates the current search string
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The search string to set
     */
    setSearchString: (state, action) => {
      state.searchString = action.payload;
    },

    /**
     * Sets the width of the first pane
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {number} action.payload - The width to set for the first pane
     */
    setFirstPaneWidth: (state, action) => {
      state.firstPaneWidth = action.payload;
    },

    /**
     * Updates the currently selected operation
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string|null} action.payload - The ID of the operation to select
     */
    setSelectedOperation: (state, action) => {
      state.selectedOperation = action.payload;
    },

    // hover actions
    /**
     * Sets an operation as being hovered over
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The ID of the operation node being hovered
     */
    hoverOperation: (state, action) => {
      const operationNodeId = action.payload;
      state.hover.operation = operationNodeId;
    },

    /**
     * Sets a table as being hovered over
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The ID of the table being hovered
     */
    hoverTable: (state, action) => {
      const tableId = action.payload;
      state.hover.table = tableId;
    },

    /**
     * Sets a column index as being hovered over
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {number} action.payload - The index of the column being hovered
     */
    setHoverColumnIndex(state, action) {
      const columnIndex = action.payload;
      state.hover.columnIndex = columnIndex;
    },

    /**
     * Sets both a table and column index as being hovered over
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {Object} action.payload - The hover information
     * @param {string} action.payload.tableId - The ID of the table being hovered
     * @param {number} action.payload.columnIndex - The index of the column being hovered
     */
    hoverColumnIndexInTable: (state, action) => {
      const { tableId, columnIndex } = action.payload;
      state.hover.table = tableId;
      state.hover.columnIndex = columnIndex;
    },

    setHoverColumnId(state, action) {
      const columnId = action.payload;
      state.hover.columnId = columnId;
    },

    // Unhover actions
    /**
     * Removes the hover state from the current operation
     *
     * @param {Object} state - The current state
     */
    unhoverOperation: (state) => {
      state.hover.operation = initialState.hover.operation;
    },

    /**
     * Removes the hover state from the current table
     *
     * @param {Object} state - The current state
     */
    unhoverTable: (state) => {
      state.hover.table = initialState.hover.table;
    },

    /**
     * Removes the hover state from the current column index
     *
     * @param {Object} state - The current state
     */
    unsetHoverColumnIndex(state) {
      state.hover.columnIndex = initialState.hover.columnIndex;
    },

    unsetHoverColumnId(state) {
      state.hover.columnId = initialState.hover.column;
    },

    /**
     * Removes the hover state from both table and column index
     *
     * @param {Object} state - The current state
     */
    unhoverColumnIndexInTable: (state) => {
      state.hover.table = null;
      state.hover.columnIndex = null;
    },

    /**
     * Sets an operation as focused
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The ID of the operation node to focus
     */
    focusOperation: (state, action) => {
      const operationNodeId = action.payload;
      state.focused.operation = operationNodeId;
    },

    /**
     *
     * Sets a column as focused
     *
     * @param {Object} state - The current state
     * @param {Object} action - The action object
     * @param {string} action.payload - The ID of the column to focus
     */
    focusColumn: (state, action) => {
      if (Array.isArray(action.payload)) {
        const columnIds = action.payload;
        state.focused.columns = [...state.focused.columns, ...columnIds];
      } else {
        const columnId = action.payload;
        state.focused.columns.push(columnId);
      }
    },

    /**
     * Removes focus from the current operation
     *
     * @param {Object} state - The current state
     */
    unfocusOperation: (state) => {
      state.focused.operation = initialState.focused.operation;
    },

    /**
     * Removes focus from the current operation
     *
     * @param {Object} state - The current state
     */
    unfocusColumn: (state, action) => {
      const unfocusColumnId = action.payload;
      state.focused.columns = state.focused.columns.filter(
        (columnId) => columnId !== unfocusColumnId
      );
    },
  },
});

function checkPayload(value, options) {
  if (!options.includes(value)) {
    throw new Error("Non-valid state option");
  }
}

// Action creators are generated for each case reducer function
export const {
  setWorkflow,
  setSidebarStatus,
  setInsertionMode,
  setFocusedNode,
  setStage,
  setSearchString,
  setFirstPaneWidth,
  setSelectedOperation,

  hoverOperation,
  hoverTable,
  hoverColumnIndexInTable,

  setHoverColumnIndex,
  unsetHoverColumnIndex,

  setHoverColumnId,
  unsetHoverColumnId,

  unhoverOperation,
  unhoverTable,
  unhoverColumnIndexInTable,

  focusOperation,
  focusColumn,

  unfocusOperation,
  unfocusColumn,
} = uiSlice.actions;

export default uiSlice.reducer;
