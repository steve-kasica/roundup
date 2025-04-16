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
    renameColumnFailure
} = slice.actions;

export default slice.reducer;