import slice from "./tablesSlice";
export * from "./Table";
export * from "./tableSelectors";
export const {
  fetchTablesRequest,
  fetchTablesFailure,
  decrementColumnCount,
  setTableSelectedStatus,
  incrementRowsExplored,
  addOpenRefineProjects,
} = slice.actions;
export default slice.reducer;
