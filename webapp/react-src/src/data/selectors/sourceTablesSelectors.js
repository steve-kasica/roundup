export const getTableById = (state, tableId) => {
  const table = state.sourceTables.data[tableId];
  return table;
};

export function getSourceTableById(state, tableId) {
  return state.sourceTables.data[tableId];
}

export const getAllSourceTables = ({ sourceTables }) =>
  Object.values(sourceTables.data);

export const getSourceTablesLoadingStatus = ({ sourceTables }) =>
  sourceTables.loading;

export const getSourceTablesError = ({ sourceTables }) => sourceTables.error;
