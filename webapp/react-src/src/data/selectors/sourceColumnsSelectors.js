import { createSelector } from "@reduxjs/toolkit";

export const getColumnsByTableId = createSelector(
    [
        state => state.sourceColumns.data,
        (_, node) => node.data.tableId,
    ],
    (columnData, tableId) => {
        // columnData[tableId]
        return null;
    }
);

// () => {
//     const columns = useSelector(({sourceColumns}) => sourceColumns.data[tableId] ?? Array.from({length: table.columnCount}, (_, i) => new Column('foo', i, null, {}, null, tableId, COLUMN_STATUS_VISABLE)));
// };