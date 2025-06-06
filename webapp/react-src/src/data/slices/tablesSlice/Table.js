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
  remoteId,
  source,
  name,
  columnCount,
  rowCount,
  dateCreated,
  dateLastModified,
  tags = []
) {
  if (!remoteId) {
    throw new Error("`remoteId` is undefined");
  } else if (!Number.isInteger(rowCount)) {
    throw new Error("`rowCount` must be an integer", rowCount);
  } else if (dateCreated instanceof Date) {
    throw new Error(
      "`dateCreated` cannot be a Date instance for serializability"
    );
  } else if (dateLastModified instanceof Date) {
    throw new Error(
      "`dateLastCreated` cannot be a Date instance for serializability"
    );
  }

  return {
    id: `t-${++idCounter}`,
    remoteId,
    source,
    name,
    columnCount, // deprecated, use `columnIds.length` instead
    columnIds: new Array(columnCount).fill(null), // Placeholder for column IDs
    rowCount,
    rowsExplored: 0,
    dateCreated,
    dateLastModified,
    tags,
  };
}

export const isTable = (obj) =>
  Object.hasOwn(obj, "id") &&
  Object.hasOwn(obj, "remoteId") &&
  Object.hasOwn(obj, "source") &&
  Object.hasOwn(obj, "name") &&
  Object.hasOwn(obj, "rowCount") &&
  Object.hasOwn(obj, "columnCount") &&
  Object.hasOwn(obj, "rowsExplored") &&
  Object.hasOwn(obj, "dateCreated") &&
  Object.hasOwn(obj, "dateLastModified") &&
  Object.hasOwn(obj, "tags");

export const isTableId = (id) => typeof id === "string" && id.startsWith("t-");
