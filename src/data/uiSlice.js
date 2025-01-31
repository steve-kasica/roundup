/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";

export const SIDEBAR_CLOSED = "closed";

export const SIDEBAR_SOURCE_TABLES = 0;
export const SIDEBAR_SOURCE_COLUMNS = 1;
export const SIDEBAR_ISSUES = 2;
export const SIDEBAR_EXPORT = 3;

export const SIDEBAR_CONFIG = "config";

export const DRAWER_CLOSED = "closed";
export const DRAWER_SOURCE_COLUMNS = "source columns"

// export const MODE_SELECT_TABLE = 0;
// export const MODE_STACK_TABLE = 1;
// export const MODE_PACK_TABLE = 2;
// export const MODE_ADD_TABLE_TO_GROUP = 3;
// export const MODE_GUIDED_PLACEMENT = 4;

// Enumerate valid options for `insertionMode` property
export const ADD_TO_GROUP = "add";
export const SYSTEM_DECIDES = "system";

export const initialState = {
    workflow: null,
    sidebarStatus: SIDEBAR_SOURCE_TABLES,
    insertionMode: SYSTEM_DECIDES,
    focusedNode: null,
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
    }
});

// Action creators are generated for each case reducer function
export const {
    setWorkflow,
    setSidebarStatus,
    setInsertionMode,
    setFocusedNode
} = uiSlice.actions;

export default uiSlice.reducer;