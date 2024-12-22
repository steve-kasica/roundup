/**
 * uiSlice.js
 */

import { createSlice } from "@reduxjs/toolkit";
import { sourceColumnGroups } from "../lib/sourceColumnGroups";

const initialState = {
    workflow: null,
    sourceColumnGroup: "table-name",
    sourceColumnGroupSearchString: "",
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
        }
}});

// Action creators are generated for each case reducer function
export const {
    setWorkflow,
    setSourceColumnGroup,
    setSourceColumnSearchString
} = uiSlice.actions;

export default uiSlice.reducer;