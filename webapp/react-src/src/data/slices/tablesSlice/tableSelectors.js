import { createSelector } from "reselect";
import { selectColumnById } from "../columnsSlice";

export const selectTables = createSelector(
  // Input selectors
  (state) => state.tables.data,
  (_, tableIds) => tableIds,

  // Result function
  (data, tableIds) => {
    return Object.entries(data)
      .filter(([tableId, table]) => tableIds.includes(tableId))
      .map(([tableId, table]) => table);
  }
);

export const selectTableById = (state, tableIds) => {
  if (Array.isArray(tableIds)) {
    return tableIds.map((id) => state.tables.data[id]);
  }
  return state.tables.data[tableIds];
};

export const selectTableByColumnId = createSelector(
  // Input selectors
  (state, columnIds) => (Array.isArray(columnIds) ? columnIds : [columnIds]),
  (state) => state,
  // Result function
  (columnIds, state) => {
    const tableIds = columnIds.map(
      (columnId) => selectColumnById(state, columnId).tableId
    );
    return selectTableById(
      state,
      tableIds.length === 1 ? tableIds[0] : tableIds
    );
  }
);

export const getTableById = (state, tableId) => {
  const table = state.tables.data[tableId];
  return table;
};

export const getAllTables = createSelector(
  [(state) => state.tables.data],
  (data) => Object.values(data)
);
