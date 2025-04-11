import { createSlice } from "@reduxjs/toolkit";
import {Column} from ".";

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
        fetchMultipleRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchMultipleSuccess: (state) => {
            state.loading = false;
            state.error = null;
        },
        fetchMultipleFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error fetching columns", action);                        
            }
            state.loading = false;
            state.error = action.payload;
        },
        fetchSingleRequest: (state, action) => {
            const projectId = action.payload;
            state.data[projectId] = {
                loading: true,
                error: null,
                columns: [],       
            };
        },
        fetchSingleSuccess: (state, action) => {
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
            
            state.data[projectId].loading = false;
            state.data[projectId].error = null;            
            state.data[projectId].columns = columns;
        },
        fetchSingleFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error fetching columns", action);                        
            }
            const {error, projectId} = action.payload;

            state.data[projectId].loading = false;
            state.data[projectId].columns = [];
            state.data[projectId].error = error;
        },
    }
});

export default slice;