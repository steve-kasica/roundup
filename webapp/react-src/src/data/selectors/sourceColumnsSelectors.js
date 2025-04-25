import { createSelector } from "reselect";

export const getColumnByTableIndex = (state, tableId, index) => {
  return Object.values(state.sourceColumns).find(
    (column) => column.parentId === tableId && column.index === index
  );
};

export function getColumnsByTableId(state, tableId) {
  const columns = Object.values(state.sourceColumns).filter(
    (column) => column.parentId === tableId
  );
  return columns;
}

// TODO: maybe this slice should cache a map of column Ids to table Ids
export function getColumnIdsByTableId(state, tableId) {
  return state.sourceColumns.columnsByTable[tableId];
}

export function getColumnById(state, id) {
  const column = state.sourceColumns.entries[id];
  return column;
}

export const selectColumnIdsByTable = (state) =>
  state.sourceColumns.columnsByTable;

// Memoized selector
export const getColumnIdsByIndex = createSelector(
  [selectColumnIdsByTable, (_, index) => index],
  (columnsByTable, index) => {
    return Object.values(columnsByTable).map((columnIds) =>
      index < columnIds.length ? columnIds[index] : null
    );
  }
);
