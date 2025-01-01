/**
 * issuesSlice.js
 * -------------------------------
 * - Updates async after changes to the data state
 */

import { createSlice } from "@reduxjs/toolkit";
import * as mismatchedNames from "../lib/schema-issues/mismatched-column-names"
import * as nullCells from "../lib/schema-issues/null-cells"

const rules = [mismatchedNames, nullCells];

const initialState = {
    items: rules.reduce((acc, rule) => ({
        ...acc, 
        [rule.id]: {
            name: rule.name, 
            description: rule.description,
            instances: [],
            isSilent: false,
        }
    }), {}),
};

export const issuesSlice = createSlice({
    name: "issues",
    initialState,
    reducers: {
        runRules: (state, action) => {
            const { data:schema } = action.payload;
            rules.forEach(rule => {
                const results = rule.run(schema);
                state.items[rule.id].instances = results;
            });
        },
        silenceIssue: (state, action) => {
            const id = action.payload;  // equals rule.id, respectively
            state.items[id].isSilent = true;
        },
        unSilenceIssue: (state, action) => {
            const id = action.payload;  // equals rule.id, respectively
            state.items[id].isSilent = false;
        },
    }
});

// Action creators are generated for each case reducer function
export const {runRules, silenceIssue, unSilenceIssue} = issuesSlice.actions;

export default issuesSlice.reducer;