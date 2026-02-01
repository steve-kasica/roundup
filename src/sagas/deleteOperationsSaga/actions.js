/**
 * @fileoverview Delete operations saga action creators.
 * @module sagas/deleteOperationsSaga/actions
 *
 * Redux action creators for operation deletion saga operations.
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for initiating operation deletion.
 * @function deleteOperationsRequest
 * @param {Array<string>} payload - The payload containing operation IDs to delete.
 *   ['op1', 'op2', ...]
 * @returns {Object} Redux action.
 */
export const deleteOperationsRequest = createAction(
  "sagas/deleteOperations/request",
);

/**
 * Action creator for signaling successful operation deletion.
 * @function deleteOperationsSuccess
 * @returns {Object} Redux action.
 */
export const deleteOperationsSuccess = createAction(
  "sagas/deleteOperations/success",
);
