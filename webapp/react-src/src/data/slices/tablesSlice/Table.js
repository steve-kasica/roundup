export const ID_ATTR = "id";
export const dataType = "SourceTable";

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
  id,
  name,
  rowCount,
  dateCreated,
  dateLastModified,
  tags = []
) {
  if (!id) {
    throw new Error("`id` is undefined");
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
    id,
    name,
    rowCount,
    rowsExplored: 0,
    dateCreated,
    dateLastModified,
    tags,
    // TODO: remove from data object
    status: {
      isSelected: false,
      isHovered: false,
    },
  };
}

export const isTable = (obj) =>
  Object.hasOwn(obj, "id") &&
  Object.hasOwn(obj, "name") &&
  Object.hasOwn(obj, "rowCount") &&
  Object.hasOwn(obj, "rowsExplored") &&
  Object.hasOwn(obj, "dateCreated") &&
  Object.hasOwn(obj, "dateLastModified") &&
  Object.hasOwn(obj, "tags");
