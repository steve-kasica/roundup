import { createSelector } from 'reselect';
import { getColumnId } from "../slices/sourceColumnsSlice";

export const getColumnByTableIndex = (state, tableId, index) => {
    const columnId = getColumnId(tableId, index);
    const column = state.sourceColumns.entries[columnId];
    return column;
}

/**
 * 
 */
export const getColumnById = createSelector(
    [
        state => state.sourceColumns.data,
        (_, tableId) => tableId,
        (_, columnId) => columnId
    ],
    (columnsRequest, tableId, columnId) => columnsRequest[tableId].columns
        .find(({id}) => id === columnId)
);

export const getColumnsByTableId = createSelector(
    [
        state => state.sourceColumns.data,
        (_, node) => node.data.tableId,
    ],
    (columnData, tableId) => {
        return null;
    }
);
