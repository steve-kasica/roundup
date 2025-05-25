import slice from "./sourceTablesSlice";
export * from "./Table";
export const {
  fetchTablesRequest,
  fetchTablesFailure,
  decrementColumnCount,
  setTableSelectedStatus,
  setTableHoveredStatus,
  incrementRowsExplored,
  addOpenRefineProjects,
} = slice.actions;
export default slice.reducer;
