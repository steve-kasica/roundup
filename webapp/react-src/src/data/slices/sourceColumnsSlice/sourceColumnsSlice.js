import { createSlice } from "@reduxjs/toolkit";
import {Column, COLUMN_STATUS_VISABLE, getColumnId} from ".";

const initialState = {
    entries: {},
    loading: false,
    error: null,
}

const slice = createSlice({
    name: "sourceColumns",
    initialState,
    reducers: {
        // Action to trigger the saga
        fetchSourceTableColumnsRequest: (state, action) => {
            const {tableId, columnCount} = action.payload;
            for (let i = 0; i < columnCount; i++) {
                const columnId = getColumnId(tableId, i);
                state.entries[columnId] = new Column(
                    tableId,
                    i,
                    undefined,
                    undefined,
                    COLUMN_STATUS_LOADING
                );
            }
        },
        fetchSourceTableColumnsSuccess: (state) => {
            const {tableId, response:columnsInfo} = action.payload;
            columnsInfo.forEach((columnInfo, i) => {
                const columnId = getColumnId(tableId, i);
                state.entries[columnId].name = columnInfo.name;
                state.entries[columnId].columnType = columnInfo.is_numeric ? "categorical" : "numeric";
                state.entries[columnId].status = COLUMN_STATUS_VISABLE;
                state.entries[columnId].error = null;
            });
        },
        fetchSourceTablesColumnsFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error fetching columns", action);                        
            }
        },
        fetchSingleRequest: (state, action) => {
            const {tableId, index} = action.payload;
            const columnId = getColumnId(tableId, index);
            state.entries[columnId] = {
                loading: true,
                error: null,
                data: null,
            };
        },
        fetchSingleSuccess: (state, action) => {
            const {response:columnsInfo, tableId} = action.payload;

            // Process columnInfo response into array of Column instances
            columnsInfo.forEach((columnInfo, index) => {
                const columnId = getColumnId(tableId, index);
                state.entries[columnId] = {
                    loading: false,
                    error: null,
                    data: new Column(
                        tableId,
                        index,
                        columnInfo.name,                                    // name
                        columnInfo.is_numeric ? "categorical" : "numeric",  // columnType
                    )
                }
            });
        },
        fetchSingleFailure: (state, action) => {
            if (process.env.NODE_ENV === "development") {
                console.error("Error fetching columns", action);                        
            }
            // TODO: handle error
        },
        renameColumnRequest: (state, action) => {
            const {tableId, columnIndex} = action.payload;
            const columnId = getColumnId(tableId, columnIndex);
            const column = state.entries[columnId];
            if (column) {
                column.loading = true;
                column.error = null;                
            }
        },
        renameColumnSuccess: (state, action) => {
            const {tableId, columnIndex, newColumnName} = action.payload;
            const columnId = getColumnId(tableId, columnIndex);
            const column = state.entries[columnId];
            if (column) {
                column.loading = false;
                column.error = null;
                column.data.name = newColumnName;                
            }
        },
        renameColumnFailure: (state, action) => {
            const {tableId, columnIndex} = action.payload;
            const columnId = getColumnId(tableId, columnIndex);
            const column = state.entries[columnId];
            if (column) {
                column.loading = false;
                column.error = action.payload.error;
            }
        },
        /**
         * Update state to reflect the start of a column removal process.
         */
        removeColumnRequest: (state, action) => {
            const {tableId, columnIndex} = action.payload;
            const columnId = getColumnId(tableId, columnIndex);
            const column = state.entries[columnId];
            if (column) {
                column.loading = true;
                column.error = null;                
            }
        },
        /**
         * Update state to reflect the successful removal of a column
         * and remove the column from the columns array for that particular
         * project.
         */
        removeColumnSuccess: (state, action) => {
            const {tableId, columnIndex} = action.payload;
            const columnId = getColumnId(tableId, columnIndex);
            const column = state.entries[columnId];
            if (column) {
                delete state.entries[columnId];
            }
        },
        /**
         * Update state to reflect the failure of a column removal process.
         */
        removeColumnFailure: (state, action) => {
            const {tableId, columnIndex} = action.payload;
            const columnId = getColumnId(tableId, columnIndex);
            const column = state.entries[columnId];
            if (column) {
                column.loading = false;
                column.error = error;
            }
        },
    }
});

export default slice;