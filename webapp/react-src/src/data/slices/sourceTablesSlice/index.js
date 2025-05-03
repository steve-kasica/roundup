import slice from "./sourceTablesSlice";

export * from "./types";
export const {
  fetchTablesRequest,
  fetchTablesSuccess,
  fetchTablesFailure,
  decrementColumnCount,
  setTableSelectedStatus,
  setTableHoveredStatus,
} = slice.actions;
export default slice.reducer;
