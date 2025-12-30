/**
 * @fileoverview columnTypes Module
 *
 * DuckDB column type constants and mapping utilities. Provides type definitions for
 * all supported DuckDB types and functions to map between DuckDB types and application
 * column types (categorical, numerical, date, boolean).
 *
 * Features:
 * - All DuckDB type constants
 * - Type mapping to application types
 * - Supported types list for auto-detection
 * - Type category classification
 *
 * @module lib/duckdb/columnTypes
 *
 * @example
 * import { DUCKDB_TYPE_VARCHAR, mapDuckDBTypeToColumnType } from './columnTypes';
 */

// https://duckdb.org/docs/stable/sql/data_types/typecasting#:~:text=Implicit%20Casting,passed%20to%20the%20sin%20function.
import {
  COLUMN_TYPE_BOOLEAN,
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_DATE,
  COLUMN_TYPE_NUMERICAL,
} from "../../slices/columnsSlice";

// All DuckDB type constants
export const DUCKDB_TYPE_BOOLEAN = "BOOLEAN";
export const DUCKDB_TYPE_BOOL = "BOOL";
export const DUCKDB_TYPE_LOGICAL = "LOGICAL";
export const DUCKDB_TYPE_TINYINT = "TINYINT";
export const DUCKDB_TYPE_INT1 = "INT1";
export const DUCKDB_TYPE_INT2 = "INT2";
export const DUCKDB_TYPE_SHORT = "SHORT";
export const DUCKDB_TYPE_INT4 = "INT4";
export const DUCKDB_TYPE_INT = "INT";
export const DUCKDB_TYPE_SIGNED = "SIGNED";
export const DUCKDB_TYPE_INT8 = "INT8";
export const DUCKDB_TYPE_LONG = "LONG";
export const DUCKDB_TYPE_SMALLINT = "SMALLINT";
export const DUCKDB_TYPE_INTEGER = "INTEGER";
export const DUCKDB_TYPE_BIGINT = "BIGINT";
export const DUCKDB_TYPE_HUGEINT = "HUGEINT";
export const DUCKDB_TYPE_UTINYINT = "UTINYINT";
export const DUCKDB_TYPE_USMALLINT = "USMALLINT";
export const DUCKDB_TYPE_UINTEGER = "UINTEGER";
export const DUCKDB_TYPE_UBIGINT = "UBIGINT";
export const DUCKDB_TYPE_UHUGEINT = "UHUGEINT";
export const DUCKDB_TYPE_BIGNUM = "BIGNUM";
export const DUCKDB_TYPE_FLOAT = "FLOAT";
export const DUCKDB_TYPE_DOUBLE = "DOUBLE";
export const DUCKDB_TYPE_DECIMAL = "DECIMAL";
export const DUCKDB_TYPE_VARCHAR = "VARCHAR";
export const DUCKDB_TYPE_DATE = "DATE";

export const SUPPORTED_TYPES = [DUCKDB_TYPE_DOUBLE, DUCKDB_TYPE_VARCHAR];

/**
 * Maps DuckDB column types to Roundup column types.
 *
 * @param {string} duckDBColumnType - The DuckDB column type to map.
 * @returns {string|null
 */
export const duckDBToRoundupTypes = (duckDBColumnType) => {
  let output = "";
  switch (duckDBColumnType) {
    case DUCKDB_TYPE_DOUBLE:
      output = COLUMN_TYPE_NUMERICAL;
      break;
    case DUCKDB_TYPE_VARCHAR:
      output = COLUMN_TYPE_CATEGORICAL;
      break;
    default:
      output = null;
  }
  return output;
};

export const RoundupToDuckDBTypes = (roundUpType) => {
  let output = "";
  switch (roundUpType) {
    case COLUMN_TYPE_NUMERICAL:
      output = DUCKDB_TYPE_DOUBLE;
      break;
    case COLUMN_TYPE_CATEGORICAL:
      output = DUCKDB_TYPE_VARCHAR;
      break;
    default:
      output = null;
  }
  return output;
};
