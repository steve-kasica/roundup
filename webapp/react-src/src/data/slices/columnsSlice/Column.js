/*
 * Column.js
 *
 * This module defines the structure and utilities for handling column metadata within a table data context.
 * It provides a serializable factory function for creating columns, constants for column types, a type-checking utility,
 * and a custom error class for invalid column types.
 *
 * Exports:
 *
 * - DATA_TYPE: Identifies the data type as "COLUMN".
 * - COLUMN_TYPE_CATEGORICAL: String constant "CATEGORICAL" for categorical columns.
 * - COLUMN_TYPE_NUMERICAL: String constant "NUMERICAL" for numerical columns.
 * - COLUMN_TYPES: Array of valid column types (["NUMERICAL", "CATEGORICAL"]).
 *
 * - Column(tableId, index, name, columnType):
 *     Factory function to create a new column object with a unique ID, associated table ID, name, index, type,
 *     and an empty values object. Throws an error if required parameters are missing or if columnType is invalid.
 *
 * - isColumn(obj):
 *     Checks if a given object matches the structure of a column created by the factory function.
 *     Returns true if the object is a valid column, otherwise false.
 *
 * - InvalidColumnTypeError:
 *     Custom error class for handling invalid column type assignments. Extends the standard Error class and
 *     provides a descriptive error message.
 *
 * Usage:
 *
 * - Use the Column function to create new serializable column objects for storing data in Redux.
 * - Use isColumn to verify if an object is a valid column.
 * - Use the constants to ensure type safety and consistency across the codebase.
 * - Catch InvalidColumnTypeError to handle invalid column type errors specifically.
 */

/**
 * Counter used to generate unique IDs for columns.
 * @type {number}
 * @private
 */
let idCounter = 0;

/**
 * @constant {string} DATA_TYPE
 * Represents the data type of the object returned by the Column factory function.
 * This is used to identify the type of data being handled, elsewhere in the codebase.
 */
export const DATA_TYPE = "COLUMN";

export const COLUMN_TYPE_CATEGORICAL = "CATEGORICAL";
export const COLUMN_TYPE_NUMERICAL = "NUMERICAL";
export const COLUMN_TYPE_DATE = "DATE";
/**
 * An array containing the supported column types.
 *
 * @constant
 * @type {Array<string>}
 * @see COLUMN_TYPE_NUMERICAL
 * @see COLUMN_TYPE_CATEGORICAL
 *
 * @example
 * // Check if a type is supported
 * if (COLUMN_TYPES.includes(type)) {
 *   // handle supported type
 * }
 */
export const COLUMN_TYPES = [
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_CATEGORICAL,
  null, // null is used to represent an "empty" column type, e.g. when the column is not yet defined
];

/**
 * Creates a new column metadata object.
 *
 * @param {string|number} tableId - The unique identifier of the table this column belongs to.
 * @param {number} index - The index/position of the column in the table.
 * @param {string} name - The display name of the column.
 * @param {string} columnType - The type of the column. Must be one of the values in COLUMN_TYPES.
 * @throws {Error} If any required parameter is undefined or if columnType is invalid.
 * @returns {Object} The newly created column object with properties: id, tableId, name, index, columnType, and values.
 */
export default function Column(tableId, index, name, columnType) {
  if (tableId === undefined) {
    throw new Error("Param undefined `tableId`");
  } else if (index === undefined) {
    throw new Error("Param undefined, `index`");
  } else if (columnType === undefined) {
    throw new Error("Param undefined, `columnType`");
  }

  return {
    id: `c-${idCounter++}`,
    tableId,
    name,
    index,
    columnType,
    values: {},
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
    "id" in obj &&
    typeof obj.id === "string" &&
    obj.id.startsWith("c-") &&
    "tableId" in obj &&
    "name" in obj &&
    "index" in obj &&
    "columnType" in obj
  );
}

/**
 * Error thrown when an invalid column type is provided.
 * There is no built-in JavaScript Error class specifically for invalid enum/type cases like this.
 * I define my own InvalidColumnTypeError to distinguish this error type in the codebase.
 *
 * @class
 * @extends Error
 * @param {string} columnType - The invalid column type that was provided.
 * @property {string} name - The name of the error ("InvalidColumnTypeError").
 * @example
 * throw new InvalidColumnTypeError('foo');
 */
export class InvalidColumnTypeError extends Error {
  constructor(columnType) {
    super(
      `Invalid columnType: ${columnType}. Must be one of ${COLUMN_TYPES.join(
        ", "
      )}`
    );
    this.name = "InvalidColumnTypeError";
  }
}
