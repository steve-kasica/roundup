/**
 * @fileoverview Hooks Module Index
 *
 * Central export file for all custom React hooks used in the application. These hooks
 * provide data fetching, state management, and utility functions for interacting with
 * DuckDB and managing table/column data.
 *
 * Exported Hooks:
 * - useColumnValues: Fetch column values from DuckDB
 * - useTableRowData: Fetch table rows with sorting and pagination
 * - usePaginatedTableRows: Paginated table row fetching
 * - useMatchValues: Fetch join match values between tables
 * - usePackStats: Calculate PACK (join) statistics
 *
 * @module hooks
 *
 * @example
 * import { useColumnValues, useTableRowData, usePackStats } from './hooks';
 */

export { useColumnValues } from "./useColumnValues.js";
export { useTableRowData, usePaginatedTableRows } from "./useTableRowData.js";
// export { default as useMatchValues } from "./useMatchValues.js";
export { default as usePackStats } from "./usePackStats.js";
