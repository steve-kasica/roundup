import slice from "./sourceColumnsSlice.js"

export * from "./types";

export const {
    fetchMultipleRequest, 
    fetchMultipleSuccess, 
    fetchMultipleFailure,
    
    fetchSingleRequest,
    fetchSingleSuccess,
    fetchSingleFailure,

    fetchSourceTableColumnsRequest,
    fetchSourceTableColumnsSuccess,
    fetchSourceTablesColumnsFailure,

    renameColumnRequest,
    renameColumnSuccess,
    renameColumnFailure,

    removeColumnRequest,
    removeColumnSuccess,
    removeColumnFailure
} = slice.actions;

export default slice.reducer;