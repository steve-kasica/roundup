/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";
import { sourceColumnGroups } from "../lib/sourceColumnGroups";

export const SIDEBAR_CLOSED = "closed";
export const SIDEBAR_SOURCE_COLUMNS = "source-columns";
export const SIDEBAR_ISSUES = "issues";
export const SIDEBAR_CONFIG = "config";

const initialState = {
    workflow: null,
    sourceColumnGroup: "table-name",
    sourceColumnGroupSearchString: "",
    sidebarStatus: SIDEBAR_SOURCE_COLUMNS,
}

export const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setWorkflow: ( state, action ) => {
            const workflow = action.payload;
            state.workflow = workflow;
        },
        setSourceColumnGroup: (state, action) => {
            const groupKey = action.payload;
            const validOptions = [...sourceColumnGroups.keys()];
            if (!validOptions.includes(groupKey)) {
                throw new Error("Invalid option")
            } else {
                state.sourceColumnGroup = groupKey;
            }
        },
        setSourceColumnSearchString: (state, action) => {
            const searchString = action.payload;
            state.sourceColumnGroupSearchString = searchString;
        },
        setSidebarStatus: (state, action) => {
            const status = action.payload;
            state.sidebarStatus = status;
        }
}});

// Action creators are generated for each case reducer function
export const {
    setWorkflow,
    setSourceColumnGroup,
    setSourceColumnSearchString,
    setSidebarStatus
} = uiSlice.actions;

export default uiSlice.reducer;