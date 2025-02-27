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
    status=COLUMN_STATUS_VISABLE
) {
    return {
        id: `c-${++id}`,
        name,
        index,
        columnType,
        values,
        endpoint,
        tableId,
        status,
        original: {name},
    }
}

export function isColumn(obj) {
    return (
        Object.hasOwn(obj, "values") &&
        Object.hasOwn(obj, "index") &&
        Object.hasOwn(obj, "columnType")
    )
}