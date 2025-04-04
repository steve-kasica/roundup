/**
 * @name sourceColumnsSlice.js
 * 
 * 
 * 
 * 
 */
import { createSlice } from "@reduxjs/toolkit";

// export const COLUMN_STATUS_VISABLE = 'visable';
// export const COLUMN_STATUS_REMOVED = 'removed';
// export const COLUMN_STATUS_NULLED = 'nulled';

let idCounter = 0;

function Column(
    name,
    index,
    columnType,
    // values
    parentId,  // projectID in OpenRefine
) {
    return {
        id: `c-${++idCounter}`,
        parentId,
        name,
        index,
        columnType,
        // values,
    }
}

const initialState = {
    ids: [],
    data: {},
    loading: false,
    error: null,
}

const slice = createSlice({
    name: "sourceColumns",
    initialState,
    reducers: {
        // Action to trigger the saga
        fetchRequest: (state) => {
            // TODO: my main worker Saga in getSourceColumns needs to 
            // call this so that the loading and error states
            // match accordingly
            state.loading = true;
            state.error = null;
        },
        fetchSuccess: (state, action) => {
            const {response:columnsInfo, projectId} = action.payload;

            // Process columnInfo response into array of Column instances
            const columns = columnsInfo.map(
                (columnInfo, index) => new Column(
                    columnInfo.name,                                    // name
                    index,                                              // index
                    columnInfo.is_numeric ? "categorical" : "numeric",  // columnType
                    projectId,                                          // parentId
                )
            );
            
            // Update state
            state.ids.splice(-1, 0, ...columns.map(({id}) => id));
            state.data[projectId] = columns;
            state.loading = false;
            state.error = null;

        },
        fetchFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error: fetch tables failure", action);                        
            }
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {fetchRequest, fetchSuccess, fetchFailure} = slice.actions;

export default slice.reducer;