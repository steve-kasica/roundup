/**
 * @fileoverview Update operations saga action creators.
 * @module sagas/updateOperationsSaga/actions
 *
 * Redux action creators for operation update saga operations.
 *
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for requesting operation updates.
 *
 * @param {Array<Object>} payload.operationUpdates - The data to update the operation(s) with
 *    e.g. `[ { id: 'o1', name: 'operation' }, { id: 'o2', joinKey1: 'c7' } ] }`
 *
 * @returns {Object} Redux action with type "sagas/updateOperations/request"
 */
export const updateOperationsRequest = createAction(
  "sagas/updateOperations/request",
);

/**
 * Action creator for successful operation updates.
 * @param {Array<Object>} payload - The updated operation objects
 */
export const updateOperationsSuccess = createAction(
  "sagas/updateOperations/success",
);
