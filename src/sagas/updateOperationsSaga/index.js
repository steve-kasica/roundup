/**
 * @fileoverview Barrel export for updateOperationsSaga module.
 * @module sagas/updateOperationsSaga
 *
 * Re-exports actions and saga watcher for operation updates.
 *
 * @example
 * import { updateOperationsRequest, watcher } from './updateOperationsSaga';
 */
export * from "./actions";
export { default as watcher } from "./watcher";
