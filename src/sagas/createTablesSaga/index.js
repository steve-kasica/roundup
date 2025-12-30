/**
 * @fileoverview Barrel export for createTablesSaga module.
 * @module sagas/createTablesSaga
 *
 * Re-exports actions and saga watcher for table creation.
 *
 * @example
 * import { createTablesRequest, watcher } from './createTablesSaga';
 */
export * from "./actions.js";
export { default as watcher } from "./watcher.js";
