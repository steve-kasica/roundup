/**
 * Column.js
 * 
 */

export const COLUMN_STATUS_VISABLE = 'visable';
export const COLUMN_STATUS_REMOVED = 'removed';
export const COLUMN_STATUS_NULLED = 'nulled';

let id = 0;

export default function Column(
    name,
    index,
    columnType,
    values,
    endpoint,
    tableId,
) {
    return {
        id: `c-${++id}`,
        tableId,
        endpoint,
        name,
        index,
        columnType,
        values,
        status: COLUMN_STATUS_VISABLE
    }
}

export function isColumn(obj) {
    return (
        Object.hasOwn(obj, "values") &&
        Object.hasOwn(obj, "index") &&
        Object.hasOwn(obj, "columnType")
    )
}