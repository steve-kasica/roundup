/*
 * Column.js
 *
 * This module defines the structure for handling column metadata within a table data context. It provides a serializable factory function for creating column objects in Redux,
 *
 * Exports:
 *
 * - COLUMN_TYPE_CATEGORICAL: String constant "CATEGORICAL" for categorical columns.
 * - COLUMN_TYPE_NUMERICAL: String constant "NUMERICAL" for numerical columns.
 * - COLUMN_TYPES: Array of valid column types (["NUMERICAL", "CATEGORICAL"]).
 *
 *
 * Usage:
 *
 * - Use the Column function to create new serializable column objects for storing data in Redux.
 * - Use the constants to ensure type safety and consistency across the codebase.
 */

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
 * Counter used to generate unique IDs for columns.
 * @type {number}
 * @private
 */
let idCounter = 0;

/**
 * Creates a new column metadata object.
 *
 * @param {Object} params - Column configuration object.
 * @param {string|number} params.parentId - The unique identifier of the table this column belongs to.
 * @param {number} params.index - The index/position of the column in the table.
 * @param {string|null} [params.name=null] - The display name of the column. This property is mutable.
 * @param {string|null} [params.columnName=null] - The original column name from the data source.
 * @param {number|null} [params.approxUnique=null] - Approximate number of unique values in the column.
 * @param {number|null} [params.avg=null] - Average value for numerical columns.
 * @param {string|null} [params.columnType=null] - The type of the column. Must be one of the values in COLUMN_TYPES.
 * @param {number|null} [params.count=null] - Count of non-null values in the column.
 * @param {number|null} [params.max=null] - Maximum value for numerical columns.
 * @param {number|null} [params.min=null] - Minimum value for numerical columns.
 * @param {number|null} [params.nullPercentage=null] - Percentage of null values in the column.
 * @param {number|null} [params.p25=null] - 25th percentile value for numerical columns.
 * @param {number|null} [params.p50=null] - 50th percentile (median) value for numerical columns.
 * @param {number|null} [params.p75=null] - 75th percentile value for numerical columns.
 * @param {number|null} [params.std=null] - Standard deviation for numerical columns.
 * @param {*} [params.modeValue=null] - The most frequently occurring value in the column.
 * @param {number|null} [params.modeCount=null] - The frequency count of the mode value.
 * @param {Array|null} [params.topValues=null] - Array of the most common values in the column.
 * @returns {Object} The newly created column object with all the provided metadata properties.
 */
function Column({
  parentId,
  name = null,
  columnName = null,
  approxUnique = null,
  avg = null,
  columnType = null,
  count = null,
  max = null,
  min = null,
  nullPercentage = null,
  p25 = null,
  p50 = null,
  p75 = null,
  std = null,
  modeValue = null,
  modeCount = null,
  topValues = null,
}) {
  const id = `c${++idCounter}`;

  return {
    id,
    parentId,
    name,
    columnName,
    approxUnique,
    avg,
    columnType,
    count,
    max,
    min,
    nullPercentage,
    p25,
    p50,
    p75,
    std,
    modeValue,
    modeCount,
    topValues,
  };
}

export const DATABASE_ATTRIBUTES = [
  "columnType",
  "approxUnique",
  "avg",
  "count",
  "max",
  "min",
  "nullPercentage",
  "q25",
  "q50",
  "q75",
  "std",
  "modeValue",
  "modeCount",
  "topValues",
];

export default Column;
