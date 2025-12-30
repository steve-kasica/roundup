/**
 * @fileoverview Barrel export for deleteOperationsSaga module.
 * @module sagas/deleteOperationsSaga
 *
 * Re-exports actions and saga watcher for operation deletion.
 *
 * @example
 * import { deleteOperationsRequest, watcher } from './deleteOperationsSaga';
 */
export * from "./actions";

export { default as watcher } from "./watcher";
