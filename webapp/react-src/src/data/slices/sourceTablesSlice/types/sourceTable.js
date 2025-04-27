export const ID_ATTR = "id";
export const dataType = "SourceTable";

/**
 *
 * @param {*} id
 * @param {*} name
 * @param {*} rowCount
 * @param {*} columnCount
 * @param {*} dateCreated
 * @param {*} dateLastModified
 * @param {*} tags
 * @returns
 */

export function SourceTable(
  id,
  name,
  rowCount,
  columnCount,
  dateCreated,
  dateLastModified,
  tags = []
) {
  if (!id) {
    throw new Error("`id` is undefined");
  } else if (!Number.isInteger(rowCount)) {
    throw new Error("`rowCount` must be an integer", rowCount);
  } else if (!Number.isInteger(columnCount)) {
    throw new Error("`columnCount` must be an integer", rowCount);
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
    id,
    name,
    rowCount,
    columnCount,
    dateCreated,
    dateLastModified,
    tags,
    status: {
      isSelected: false,
    },
  };
}

export const isSourceTable = (obj) =>
  Object.hasOwn(obj, "id") &&
  Object.hasOwn(obj, "name") &&
  Object.hasOwn(obj, "rowCount") &&
  Object.hasOwn(obj, "columnCount") &&
  Object.hasOwn(obj, "dateCreated") &&
  Object.hasOwn(obj, "dateLastModified") &&
  Object.hasOwn(obj, "tags");
