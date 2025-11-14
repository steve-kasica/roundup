/*
 * Table.js
 *
 * This module defines the structure for handling table metadata within a table data context. It provides a serializable factory function for creating table objects in Redux,
 *
 */

/**
 * Counter used to generate unique IDs for tables.
 * Unique counters like these with a prefix not only provide a significant semantic benefit
 * because I can figure out if an error correspond to a table, column, or operations. but these IDs are also
 * unique between data object, e.g. columns, tables, and operations, are also
 * useful for react b/c we can use them in a key and we have the guarantee that each item in an array will have a unique key
 * even if its a mix of different data object types.
 * @type {number}
 * @private
 */
let idCounter = 0;

/**
 * Creates a new table metadata object.
 *
 * @param {Object} params - Table configuration object.
 * @param {string|null} [params.source=null] - The source of the table data.
 * @param {string|null} [params.name=null] - The display name of the table. This property is mutable.
 * @param {string|null} [params.fileName=null] - The original name of the file uploaded.
 * @param {string|null} [params.extension=null] - The file extension of the uploaded file.
 * @param {number|null} [params.size=null] - The size of the file in bytes.
 * @param {string|null} [params.mimeType=null] - The MIME type of the file.
 * @param {Date|string|null} [params.dateLastModified=null] - The last modified date of the file.
 * @param {string[]} [params.columnIds=[]] - Array of column IDs associated with this table.
 * @param {string|null} [params.parentId=null] - ID of the parent operation if this table is a result of an operation.
 * @returns {Object} The newly created table object with all the provided metadata properties.
 */
export function Table({
  parentId = null,
  source = null,
  databaseName = null,
  name = null,
  fileName = null,
  extension = null,
  size = null,
  mimeType = null,
  dateLastModified = null,
  columnIds = [],
  rowCount = null,
} = {}) {
  const id = `t${++idCounter}`;

  return {
    id,
    parentId,
    source,
    databaseName,
    name,
    fileName,
    extension,
    size,
    mimeType,
    dateLastModified,
    columnIds,
    rowCount,
  };
}

export const DATABASE_ATTRIBUTES = ["rowCount"];

export const isTableId = (id) => typeof id === "string" && id.startsWith("t");
