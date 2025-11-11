export const ID_ATTR = "id";
export const dataType = "SourceTable";

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
  if (dateLastModified instanceof Date) {
    throw new Error(
      "`dateLastCreated` cannot be a Date instance for serializability"
    );
  }

  const id = `t${++idCounter}`;

  return {
    id, // This unique identifier for table objects in Redux store corresponds to the name of the table in DuckDB
    parentId, // ID of the parent operation if this table is a result of an operation
    source,
    name, // name is mutable
    fileName,
    extension,
    size,
    mimeType,
    rowCount: null, // This will be set later when the table is created in DuckDB
    dateLastModified,
    columnIds,
  };
}

const attributes = [
  "id",
  "source",
  "name",
  "extension",
  "size",
  "mimeType",
  "rowCount",
  "dateLastModified",
];

export const isTable = (obj) =>
  attributes.every((attr) => Object.hasOwn(obj, attr));

export const isTableId = (id) => typeof id === "string" && id.startsWith("t");
