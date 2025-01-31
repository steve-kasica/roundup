/**
 * 
 */

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
        values
    }
}

export function isColumn(obj) {
    return (
        Object.hasOwn(obj, "values") &&
        Object.hasOwn(obj, "index") &&
        Object.hasOwn(obj, "columnType")
    )
}