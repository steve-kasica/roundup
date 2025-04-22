let idCounter = 0;

export const COLUMN_STATUS_VISABLE = "visable";
export const COLUMN_STATUS_REMOVED = "removed";
export const COLUMN_STATUS_NULLED = "nulled";
export const COLUMN_STATUS_LOADING = "loading";

/**
 *
 * @param {*} tableId
 * @param {*} index
 * @param {*} name
 * @param {*} columnType
 * @param {*} status
 * @returns
 */
export function Column(
  parentId,
  index,
  name,
  columnType,
  status = COLUMN_STATUS_VISABLE
) {
  if (parentId === undefined) {
    throw new Error("Param undefined `parentId`");
  } else if (index === undefined) {
    throw new Error("Param undefined, `index`");
  }

  return {
    id: `c-${idCounter++}`,
    parentId,
    name,
    index,
    columnType,
    status,
    error: null,
  };
}
