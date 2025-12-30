/**
 * @fileoverview Barrel export for materializeOperationSaga module.
 * @module sagas/materializeOperationSaga
 *
 * Re-exports actions and saga watcher for operation materialization.
 *
 * @example
 * import { materializeOperationRequest, watcher } from './materializeOperationSaga';
 */
export * from "./actions.js";
export { default as watcher } from "./watcher.js";
