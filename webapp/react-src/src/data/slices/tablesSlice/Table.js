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
    name,
    extension,
    size,
    mimeType,
    columnCount, // deprecated, use `columnIds.length` instead
    columnIds: new Array(columnCount).fill(null), // Placeholder for column IDs
    rowCount,
    rowsExplored: 0, // TODO: remove this
    dateLastModified,
  };
}

export const isTable = (obj) =>
  Object.hasOwn(obj, "id") &&
  Object.hasOwn(obj, "source") &&
  Object.hasOwn(obj, "name") &&
  Object.hasOwn(obj, "rowCount") &&
  Object.hasOwn(obj, "columnCount") &&
  Object.hasOwn(obj, "rowsExplored") &&
  Object.hasOwn(obj, "dateLastModified") &&
  Object.hasOwn(obj, "tags");

export const isTableId = (id) => typeof id === "string" && id.startsWith("t-");
