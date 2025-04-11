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
export const DRAWER_SOURCE_COLUMNS = "source columns"

// Enumerate valid options for `insertionMode` property
export const ADD_TO_GROUP = "add";
export const SYSTEM_DECIDES = "system";

export const STAGE_CONFIG_SOURCES = 'cs';
export const STAGE_ARRANGE_TABLES = 'at';
export const STAGE_REFINE_OPS = 'ro';
export const STAGE_EXPORT = 'e';

const STAGES = [STAGE_CONFIG_SOURCES, STAGE_ARRANGE_TABLES, STAGE_REFINE_OPS, STAGE_EXPORT];

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
    },
    hover: {
        dataType: null,
        id: null,
    }
};

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setWorkflow: ( state, action ) => {
            state.workflow = action.payload
        },
        setSidebarStatus: (state, action) => {
            state.sidebarStatus = action.payload
        },
        setInsertionMode: (state, action) => {
            state.insertionMode = action.payload
        },
        setFocusedNode: (state, action)  => {
            state.focusedNode = action.payload
        },
        setStage: (state, action) => { 
            checkPayload(action.payload, STAGES);
            state.stage = action.payload; 
        },
        setSearchString: (state, action) => {
            state.searchString = action.payload;
        },
        setFirstPaneWidth: (state, action) => {
            state.firstPaneWidth = action.payload;
        },
        setHoverOperation: (state, action) => {
            state.hoverOperation = action.payload;
        },
        setSelectedOperation: (state, action) => {
            state.selectedOperation = action.payload;
        },

        setHover: (state, action) => { 
            state.hover = action.payload; 
        },
        unsetHover: (state) => { 
            state.hover = initialState.hover; 
        },
        focusOperation: (state, action) => {
            const operationNodeId = action.payload;
            state.focused.operation = operationNodeId; 
        },
        unfocusOperation: (state) => { 
            state.focused.operation = initialState.focused.operation;
        }
    }
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
    setHoverOperation,
    setSelectedOperation,
    setHover,
    unsetHover,
    focusOperation,
    unfocusOperation
} = uiSlice.actions;

export default uiSlice.reducer;