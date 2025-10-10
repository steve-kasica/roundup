export const ID_ATTR = "id";
export const dataType = "SourceTable";

export const TABLE_SOURCE_OPEN_REFINE = "openrefine";

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
  source,
  name,
  fileName, // fileName is the original name of the file uploaded
  extension,
  size,
  mimeType,
  dateLastModified
) {
  if (dateLastModified instanceof Date) {
    throw new Error(
      "`dateLastCreated` cannot be a Date instance for serializability"
    );
  }

  const id = `t${++idCounter}`;

  return {
    id, // This unique identifier for table objects in Redux store corresponds to the name of the table in DuckDB
    source,
    name, // name is mutable
    fileName,
    extension,
    size,
    mimeType,
    columnIds: [], // This will be populated later when columns are created
    rowCount: null, // This will be set later when the table is created in DuckDB
    dateLastModified,
    operationId: null, // Parent operation ID if this table is derived from an operation
    error: null, // Error message if there was an error loading or processing the table
  };
}

const attributes = [
  "id",
  "source",
  "name",
  "extension",
  "size",
  "mimeType",
  "columnIds",
  "rowCount",
  "dateLastModified",
  "operationId",
];

export const isTable = (obj) =>
  attributes.every((attr) => Object.hasOwn(obj, attr));

export const isTableId = (id) => typeof id === "string" && id.startsWith("t");
