
let idCounter = 0;

// export const COLUMN_STATUS_VISABLE = 'visable';
// export const COLUMN_STATUS_REMOVED = 'removed';
// export const COLUMN_STATUS_NULLED = 'nulled';

export function Column(
    tableId,
    index,
    name,
    columnType,
    status,
) {
    if (tableId === undefined) {
        throw new Error("Param undefined `tableId`");
    } else if (index === undefined) {
        throw new Error("Param undefined, `index`");
    }

    return {
        id: `c-${++idCounter}`,
        tableId,
        name,
        index,
        columnType,
        status,
    }
}