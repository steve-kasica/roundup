import slice from "./sourceTablesSlice";

export * from "./types";
export const {fetchTablesRequest, fetchTablesSuccess, fetchTablesFailure} = slice.actions;
export default slice.reducer;