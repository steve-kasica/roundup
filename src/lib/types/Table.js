/**
 * Table.js
 * ---------------------------------------------------
 * A factory function for creating objects that contains Table metadata
 */

import Column from "./Column";

let id = 0;

export const type = "table";

/**
 * Table
 * ----------------------------------
 * A object for storing table data
 * 
 * Notes: It's required that this instance is serializable so it
 * can be stored in a Redux slice, hence why I'm not using Class
 * and I'm not convinced that I need to convert to TypeScript just
 * to satisfy this design requirement
 * 
 * @param {string} endpoint 
 * @param {string} name 
 * @param {number} id 
 * @param {number} row_count 
 * @param {Array} columns 
 * @returns {Object}: 
 *  - operationGroup {}: An operation id
 *  - column_count
 */
export default function Table(
    endpoint,
    name,
    id,
    row_count,
    columns,
    type=undefined,
    date_created=new Date(),
    last_modified=new Date()
) {
    return {
        endpoint,
        name: removeFileExtension(name),
        id: (id === null) ? `t-${++id}` : String(id),
        type: (type === undefined) ? getFileExtension(name) : type,
        row_count,
        date_created: date_created.toDateString(),
        last_modified: last_modified.toDateString(),
        column_count: columns.length,
        columns: columns.map(columnData => new Column(...Object.values({
            ...columnData, 
            endpoint, 
            tableId: id
        }))),

        operation_group: null  // Group contains a valid operation ID
    }
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function removeFileExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

// User-facing table properties
export const properties = [
    "name",
    "type",
    "column_count",
    "row_count",
    "date_created",
    "last_modified"
]

export function isTable(obj) {
    return (
        Object.hasOwn(obj, "row_count") &&
        Object.hasOwn(obj, "column_count") &&
        Object.hasOwn(obj, "columns") &&
        Object.hasOwn(obj, "operation_group")
    );
}