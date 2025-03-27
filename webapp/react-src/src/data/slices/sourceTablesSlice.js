/**
 * @name sourceTablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    ids: [],
    data: {},
    loading: false,
    error: null,
}

const slice = createSlice({
    name: "sourceTables",
    initialState,
    reducers: {
        // Action to trigger the saga
        fetchTablesRequest: (state) => {
            state.loading = true;
            state.error = null;
            console.log('request');                        
        },
        fetchTablesSuccess: (state, action) => {
            state.loading = false;
            state.data = action.payload.data;
            state.ids = action.payload.ids;
        },
        fetchTablesFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error: fetch tables failure", action);                        
            }
            state.loading = false;
            state.error = action.payload;
        }
    }
});

export const {fetchTablesRequest, fetchTablesSuccess, fetchTablesFailure} = slice.actions;

export default slice.reducer;