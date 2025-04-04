/**
 * @name sourceTablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";
import { Table } from "../../lib/types";

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
        },
        fetchTablesSuccess: (state, action) => {
            const projects = action.payload;

            state.ids = Object.keys(projects);

            state.ids.forEach(id => {
                state.data[id] = new Table(
                    id,                             // id        
                    projects[id].name,              // name
                    Number(projects[id].rowCount),  // row count
                    Number(0),                      // column count
                    projects[id].created,           // date created
                    projects[id].modified,          // last modified
                    projects[id].tags,              // tags
                );
            });
            state.loading = false;
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