/**
 * Table.js
 * ---------------------------------------------------
 * A factory function for creating objects that contains Table metadata
 */

import Column from "./Column";

let idCounter = 0;

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
 */


const NAME_ATTR = "name";
export const ID_ATTR = "id";
const ROW_COUNT_ATTR = "rowCount";
const COLUMN_COUNT_ATTR = "columnCount";
const DATE_CREATED_ATTR = "dateCreated";
const DATE_MODIFIED_ATTR = "dateLastModified";
const OPERATION_GROUP_ATTR = "operationGroup";
const TAGS_ATTR = "tags";

export const attributeMap = new Map([
    [NAME_ATTR, "Name"],
    [ROW_COUNT_ATTR, "Rows"],
    [COLUMN_COUNT_ATTR, "Columns"],
    [DATE_CREATED_ATTR, "Created"],
    [DATE_MODIFIED_ATTR, "Last Modified"],
])

/**
 * @param {string} endpoint 
 * @param {string} name 
 * @param {number} id 
 * @param {number} rowCount 
 * @param {Array} columns 
 * @returns {Object}: 
 *  - operationGroup {}: An operation id
 *  - columnCount
 */
export default function Table(
    id,
    name,
    rowCount,
    columnCount,
    dateCreated=new Date(),
    dateLastModified=new Date(),
    tags=[]
) {
    const table = { attributes: {} };
    table[ID_ATTR] = (id === undefined) ? `t-${++idCounter}` : id;
    table[OPERATION_GROUP_ATTR] = null;  // contains valid operation id

    table.attributes[NAME_ATTR] = name;

    if (!Number.isInteger(rowCount)) {
        throw new Error("`rowCount` must be an integer", rowCount);
    }
    table.attributes[ROW_COUNT_ATTR] = rowCount;
    
    if (!Number.isInteger(columnCount)) {
        throw new Error("`columnCount` must be an integer", rowCount);
    }

    table.attributes[COLUMN_COUNT_ATTR] = columnCount;

    if (dateCreated instanceof Date) {
        throw new Error("`dateCreated` cannot be a Date instance for serializability");
    }
    table.attributes[DATE_CREATED_ATTR] = dateCreated;

    if (dateLastModified instanceof Date) {
        throw new Error("`dateLastCreated` cannot be a Date instance for serializability");
    }
    table.attributes[DATE_MODIFIED_ATTR] = dateLastModified;
    table.attributes[TAGS_ATTR] = tags;

    return table;
    // return {
    //     endpoint,
    //     rowCount,
    //     columnCount: columns.length,
    //     date_created: date_created.toDateString(),
    //     last_modified: last_modified.toDateString(),
    //     columns: columns.map(columnData => new Column(...Object.values({
    //         ...columnData, 
    //         endpoint, 
    //         tableId: String(id)
    //     }))),
    //     tags: tags,

//        operation_group: null  
  //  }
}

function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

function removeFileExtension(filename) {
    return filename.replace(/\.[^/.]+$/, "");
}

export function isTable(obj) {
    return (
        Object.hasOwn(obj, "rowCount") &&
        Object.hasOwn(obj, "columnCount") &&
        Object.hasOwn(obj, "columns") &&
        Object.hasOwn(obj, "operation_group")
    );
}