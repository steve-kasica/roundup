/**
 * @fileoverview Barrel export for operationsSlice module.
 * @module slices/operationsSlice
 *
 * Re-exports all operation-related actions, selectors, types, and the Operation factory.
 *
 * @example
 * import { addOperations, selectOperationsById, Operation, OPERATION_TYPE_PACK } from './operationsSlice';
 */
import reducer from "./operationsSlice";
export * from "./operationsSlice"; // export all actions
export * from "./selectors";
export * from "./Operation";
export { default as Operation } from "./Operation";
export default reducer;
