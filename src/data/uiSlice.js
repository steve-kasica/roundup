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

export const initialState = {
    workflow: null,
    sidebarStatus: SIDEBAR_SOURCE_TABLES,
}

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setWorkflow: ( state, action ) => {
            const workflow = action.payload;
            state.workflow = workflow;
        },
        setSidebarStatus: (state, action) => {
            const status = action.payload;
            state.sidebarStatus = status;
        }
}});

// Action creators are generated for each case reducer function
export const {
    setWorkflow,
    setSidebarStatus
} = uiSlice.actions;

export default uiSlice.reducer;