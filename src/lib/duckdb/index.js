/**
 * @fileoverview DuckDB Module Index
 *
 * Central export file for all DuckDB utility functions. Provides re-exports
 * for table operations, column operations, statistics, and data retrieval.
 *
 * Exported modules include:
 * - Table operations: createTables, dropTable, getTableRows, getTableDimensions
 * - Column operations: getColumnStats, getColumnNames, getValueCounts
 * - Join operations: calcMatchStats, createPackView, getMatchValues
 * - Stack operations: createStackView, getVirtualStackRows
 * - File operations: registerFiles, exportTableToStreamManual
 *
 * @module lib/duckdb
 *
 * @example
 * import { getTableRows, calcMatchStats, createTables } from './lib/duckdb';
 */

export * from "./getTableRows";
export * from "./getValuesCountMatrix";
export * from "./createStackView";
export * from "./createPackView";
export * from "./getTableDimensions";
export * from "./getTableStats";
export * from "./getColumnStats";
export * from "./createTables";
export * from "./registerFiles";
export * from "./renameColumns";
export * from "./calcMatchStats";
export * from "./getValueCounts";
export * from "./getValueLength";
export * from "./getColumnNames";
export * from "./getMatchValues";
export * from "./getColumnValues";
export * from "./insertColumn";
export * from "./getColumnNames";
export * from "./dropTable";
export * from "./dropView";
export * from "./dropColumns";
export * from "./columnTypes";
export * from "./setColumnType";
