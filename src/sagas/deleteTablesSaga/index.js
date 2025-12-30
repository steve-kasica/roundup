/**
 * @fileoverview Barrel export for deleteTablesSaga module.
 * @module sagas/deleteTablesSaga
 *
 * Re-exports actions and saga watcher for table deletion.
 *
 * @example
 * import { deleteTablesRequest, watcher } from './deleteTablesSaga';
 */
export * from "./actions.js";
export { default as watcher } from "./watcher.js";
