/**
 * @fileoverview Barrel export for updateTablesSaga module.
 * @module sagas/updateTablesSaga
 *
 * Re-exports actions and saga watcher for table updates.
 *
 * @example
 * import { updateTablesRequest, watcher } from './updateTablesSaga';
 */
export * from "./actions";
export { default as watcher } from "./watcher";
