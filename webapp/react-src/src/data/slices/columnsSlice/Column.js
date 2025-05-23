let idCounter = 0;

/**
 * @constant {string} DATA_TYPE
 * Represents the data type of the object returned by the Column factory function.
 * This is used to identify the type of data being handled, elsewhere in the codebase.
 */
export const DATA_TYPE = "COLUMN";

/**
 * @constant {string} COLUMN_STATUS_VISABLE
 * Represents the default visible state of a column.
 */
export const COLUMN_STATUS_VISABLE = "visable";

/**
 * @constant {string} COLUMN_STATUS_REMOVED
 * Represents a column that has been removed.
 */
export const COLUMN_STATUS_REMOVED = "removed";

/**
 * @constant {string} COLUMN_STATUS_NULLED
 * Represents a column that has been nulled or reset.
 */
export const COLUMN_STATUS_NULLED = "nulled";

/**
 * @constant {string} COLUMN_STATUS_LOADING
 * Represents a column that is in the process of loading.
 */
export const COLUMN_STATUS_LOADING = "loading";

/**
 * Factory function to create a Column object.
 *
 * @function
 * @param {string} tableId - The ID of the parent object to which the column belongs. Required.
 * @param {number} index - The index of the column. Required.
 * @param {string} [name] - The name of the column.
 * @param {string} [columnType] - The type of the column.
 * @param {string} [status=COLUMN_STATUS_VISABLE] - The status of the column. Defaults to `COLUMN_STATUS_VISABLE`.
 * @throws {Error} Throws an error if `tableId` is undefined.
 * @throws {Error} Throws an error if `index` is undefined.
 * @returns {Object} A column object with the following properties:
 * - `id` {string}: A unique identifier for the column.
 * - `tableId` {string}: The ID of the parent table object.
 * - `name` {string}: The name of the column.
 * - `index` {number}: The index of the column.
 * - `columnType` {string}: The type of the column.
 * - `status` {string}: The status of the column.
 * - `error` {null}: Initially set to `null`.
 *
 * @example
 * import { Column, COLUMN_STATUS_LOADING } from './Column';
 *
 * const newColumn = Column('parent-1', 0, 'Column Name', 'text', COLUMN_STATUS_LOADING);
 * console.log(newColumn);
 * // {
 * //   id: 'c-0',
 * //   tableId: 'parent-1',
 * //   name: 'Column Name',
 * //   index: 0,
 * //   columnType: 'text',
 * //   status: 'loading',
 * //   error: null
 * // }
 */
export default function Column(tableId, index, name, columnType) {
  if (tableId === undefined) {
    throw new Error("Param undefined `tableId`");
  } else if (index === undefined) {
    throw new Error("Param undefined, `index`");
  }

  return {
    id: `c-${idCounter++}`,
    tableId,
    name,
    index,
    columnType,
    error: null,
    values: {},
    status: {
      isSelected: false,
      isLoading: true, // Initially set to true to indicate loading state,
      isHovered: false,
      isDragging: false,
      error: null,
    },
  };
}

export function ColumnValue(value, label = null, rowIndices = []) {
  if (value === undefined) {
    throw new Error("Param undefined `value`");
  }
  return {
    value,
    label,
    rowIndices,
  };
}

/**
 * Checks if an object was created by the Column factory function.
 *
 * @param {Object} obj - The object to check.
 * @returns {boolean} True if the object matches the structure of a Column, false otherwise.
 */
export function isColumn(obj) {
  if (obj === null || obj === undefined) {
    return false;
  }
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    obj.id.startsWith("c-") &&
    typeof obj.tableId === "string" &&
    typeof obj.index === "number" &&
    "name" in obj &&
    "columnType" in obj &&
    typeof obj.status === "string" &&
    obj.error === null &&
    typeof obj.isSelected === "boolean"
  );
}
