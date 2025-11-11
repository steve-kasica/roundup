/*
 * Table.js
 *
 * This module defines the structure for handling table metadata within a table data context. It provides a serializable factory function for creating table objects in Redux,
 *
 */

/**
 * Counter used to generate unique IDs for columns.
 * @type {number}
 * @private
 */
let idCounter = 0;

/**
 *
 * @param {*} id
 * @param {*} name
 * @param {*} rowCount
 * @param {*} dateCreated
 * @param {*} dateLastModified
 * @param {*} tags
 * @returns
 */
export function Table(
  source = null,
  name = null,
  fileName = null, // fileName is the original name of the file uploaded
  extension = null,
  size = null,
  mimeType = null,
  dateLastModified = null,
  columnIds = [],
  parentId = null
) {
  const id = `t${++idCounter}`;

  return {
    id, // This unique identifier for table objects in Redux store corresponds to the name of the table in DuckDB
    parentId, // ID of the parent operation if this table is a result of an operation
    columnIds,
    source,
    name, // name is mutable
    fileName,
    extension,
    size,
    mimeType,
    rowCount: null, // This will be set later when the table is created in DuckDB
    dateLastModified,
  };
}

export const isTableId = (id) => typeof id === "string" && id.startsWith("t");
