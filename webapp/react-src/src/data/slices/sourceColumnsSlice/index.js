import slice from "./sourceColumnsSlice.js"

export * from "./types";

export const {
    fetchMultipleRequest, 
    fetchMultipleSuccess, 
    fetchMultipleFailure,
    
    fetchSingleRequest,
    fetchSingleSuccess,
    fetchSingleFailure,

    renameColumnRequest,
    renameColumnSuccess,
    renameColumnFailure,

    removeColumnRequest,
    removeColumnSuccess,
    removeColumnFailure
} = slice.actions;

export default slice.reducer;