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
  extension,
  size,
  mimeType,
  columnCount,
  rowCount,
  dateLastModified,
  tags = []
) {
  if (!Number.isInteger(rowCount)) {
    throw new Error("`rowCount` must be an integer", rowCount);
  } else if (dateLastModified instanceof Date) {
    throw new Error(
      "`dateLastCreated` cannot be a Date instance for serializability"
    );
  }

  return {
    id: `t-${++idCounter}`,
    source,
    name, // name is immutable, so it can lookup columns in a table by name
    alias: name, // alias is mutable, so it can be changed by the user
    extension,
    size,
    mimeType,
    columnCount, // deprecated, use `columnIds.length` instead
    originalColumnIds: new Array(columnCount).fill(null), // Placeholder for original column IDs
    columnIds: new Array(columnCount).fill(null), // Placeholder for column IDs
    rowCount,
    rowsExplored: 0, // TODO: remove this
    dateLastModified,
    parentId: null, // Parent operation ID if this table is derived from an operation
  };
}

const attributes = [
  "id",
  "source",
  "name",
  "alias",
  "extension",
  "size",
  "mimeType",
  "columnCount",
  "originalColumnIds",
  "columnIds",
  "rowCount",
  "rowsExplored",
  "dateLastModified",
  "parentId",
];

export const isTable = (obj) =>
  attributes.every((attr) => Object.hasOwn(obj, attr));

export const isTableId = (id) => typeof id === "string" && id.startsWith("t-");
