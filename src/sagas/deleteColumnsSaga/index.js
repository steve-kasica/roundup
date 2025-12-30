/**
 * @fileoverview Barrel export for deleteColumnsSaga module.
 * @module sagas/deleteColumnsSaga
 *
 * Re-exports actions and saga watcher for column deletion.
 *
 * @example
 * import { deleteColumnsRequest, watcher } from './deleteColumnsSaga';
 */
export * from "./actions.js";
export { default as watcher } from "./watcher.js";
