

export const getTableById = (state, tableId) => {
    const table = state.sourceTables.data[tableId];
    return table;
};

export const getAllSourceTables = ({sourceTables}) => Object.values(sourceTables.data);

export const getSourceTablesLoadingStatus = ({sourceTables}) => sourceTables.loading;

export const getSourceTablesError = ({sourceTables}) => sourceTables.error;