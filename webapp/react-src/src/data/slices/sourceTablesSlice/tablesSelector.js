import { createSelector } from "reselect";

export const selectTables = createSelector(
  // Input selectors
  (state) => state.sourceTables.data,
  (_, tableIds) => tableIds,

  // Result function
  (data, tableIds) => {
    console.log("selectTables ran", data, tableIds);
    return Object.entries(data)
      .filter(([tableId, table]) => tableIds.includes(tableId))
      .map(([tableId, table]) => table);
  }
);

export const selectTableById = (state, tableId) => {
  return state.sourceTables.data[tableId];
};
