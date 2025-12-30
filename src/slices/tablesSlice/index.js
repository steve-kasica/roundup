/**
 * @fileoverview Barrel export for tablesSlice module.
 * @module slices/tablesSlice
 *
 * Re-exports all table-related actions, selectors, and the Table factory.
 *
 * @example
 * import { addTables, selectTablesById, Table, isTableId } from './tablesSlice';
 */
import slice from "./tablesSlice";
export * from "./Table";
export * from "./tablesSlice"; // export actions
export * from "./selectors";
export default slice.reducer;
