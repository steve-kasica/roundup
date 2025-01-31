/**
 * Table.js
 * ---------------------------------------------------
 * A factory function for creating objects that contains Table metadata
 */

import Column from "./Column";

let id = 0;

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
    columns
) {
    return {
        endpoint,
        name,
        id: (id === null) ? `t-${++id}` : id,
        row_count,
        column_count: columns.length,
        columns: columns.map(columnData => new Column(...Object.values({
            ...columnData, 
            endpoint, 
            tableId: id
        }))),

        operation_group: null  // Group contains a valid operation ID
    }
}

export function isTable(obj) {
    return (
        Object.hasOwn(obj, "row_count") &&
        Object.hasOwn(obj, "column_count") &&
        Object.hasOwn(obj, "columns") &&
        Object.hasOwn(obj, "operation_group")
    );
}