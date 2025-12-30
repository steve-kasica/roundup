/**
 * @fileoverview Barrel export for updateColumnsSaga module.
 * @module sagas/updateColumnsSaga
 *
 * Re-exports actions and saga watcher for column updates.
 *
 * @example
 * import { updateColumnsRequest, watcher } from './updateColumnsSaga';
 */
export * from "./actions";
export { default as watcher } from "./watcher.js";
