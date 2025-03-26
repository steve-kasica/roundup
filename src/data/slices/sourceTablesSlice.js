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
            state.data = action.payload;
            console.log(action.payload);
        },
        fetchTablesFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
            console.log(action.payload);            
        }
    }
});

export const {fetchTablesRequest, fetchTablesSuccess, fetchTablesFailure} = slice.actions;

export default slice.reducer;