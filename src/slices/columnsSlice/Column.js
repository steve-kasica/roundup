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
 * - Column(tableId, index, summary, children):
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
export const COLUMN_TYPE_VARCHAR = "VARCHAR";
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
  COLUMN_TYPE_VARCHAR,
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
export default function Column(
  tableId,
  index,
  summary = {
    name: null,
    columnType: null,
    approxUnique: null,
    avg: null,
    count: null,
    max: null,
    min: null,
    nullPercentage: null,
    q25: null,
    q50: null,
    q75: null,
    std: null,
  },
  children = null
) {
  if (tableId === undefined) {
    throw new Error("Param undefined `tableId`");
  } else if (index === undefined) {
    throw new Error("Param undefined, `index`");
  }

  const id = `c${++idCounter}`;

  return {
    id, // id is immutable and used as the unique identifier for table columns
    children, // operation columns have children, to be defined later (if applicable)
    tableId, // tableId is immutable and used to identify the table the column belongs to. Columns do not transfer between tables in this application.
    index,
    name: summary.name, // name is mutable and can be changed by the user
    columnType: summary.columnType, // columnType is mutable and can be changed by the user
    approxUnique: summary.approxUnique,
    avg: summary.avg,
    count: summary.count,
    max: summary.max,
    min: summary.min,
    nullPercentage: summary.nullPercentage,
    q25: summary.q25,
    q50: summary.q50,
    q75: summary.q75,
    std: summary.std,
    uniqueValues: null, // Unique values in the column, can be null if not computed yet
    totalRows: null, // Total number of rows in the column, can be null if not computed yet
    nonNullValues: null, // Number of non-null values in the column, can be null if not computed yet
    values: {}, // TODO: remove
  };
}

// Don't include `id` in the attributes array
// every objectin Roundup includes an `id`, so it's not discerning
const attributes = [
  "name",
  "tableId",
  "index",
  "columnType",
  "uniqueValues",
  "totalRows",
  "nonNullValues",
  "values",
  "children",
];

/**
 * Checks if an object was created by the Column factory function.
 *
 * @param {Object} obj - The object to check.
 * @returns {boolean} True if the object matches the structure of a Column, false otherwise.
 */
export const isColumn = (obj) =>
  obj !== null &&
  typeof obj === "object" &&
  Object.keys(obj).length > 0 &&
  attributes.every((key) => key in obj);

/**
 * Checks if an object is an operation column (a column with children).
 *
 * @param {Object} obj - The object to check.
 * @returns {boolean} True if the object matches the structure of a Column, false otherwise.
 */
export const isOperationColumn = (obj) =>
  isColumn(obj) && Array.isArray(obj.children) && obj.children.length > 0;

/**
 * Performs a shallow equality comparison between two Column instances.
 * Compares all column attributes to determine if two columns are equal.
 *
 * @param {Object} column1 - The first column to compare.
 * @param {Object} column2 - The second column to compare.
 * @returns {boolean} True if both columns have the same values for all attributes, false otherwise.
 * @example
 * const col1 = Column('table1', 0, 'name', 'VARCHAR');
 * const col2 = Column('table1', 0, 'name', 'VARCHAR');
 * const areEqual = columnsEqual(col1, col2); // false (different IDs due to counter)
 *
 * const col3 = { ...col1 };
 * const areEqual2 = columnsEqual(col1, col3); // true (same values)
 */
export const areColumnsEqual = (column1, column2) => {
  // Check if both are valid column objects
  if (!isColumn(column1) || !isColumn(column2)) {
    return false;
  }

  // Compare all attributes
  return attributes.every((key) => {
    const val1 = column1[key];
    const val2 = column2[key];

    // Handle nested objects (like values object) with shallow comparison
    if (
      typeof val1 === "object" &&
      typeof val2 === "object" &&
      val1 !== null &&
      val2 !== null
    ) {
      const keys1 = Object.keys(val1);
      const keys2 = Object.keys(val2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      return keys1.every((k) => val1[k] === val2[k]);
    }

    return val1 === val2;
  });
};

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
