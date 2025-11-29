import { createAction } from "@reduxjs/toolkit";

/**
 * Action creators for creating operations.
 *
 * @param {Array} payload.operationData - The data to create the operation(s) with
 * @param {string} payload.operationData.operationType - The type of operation to create
 * @param {Array<string>} payload.operationData.childIds - The IDs of child objects for the operation
 * @returns {Object} Redux action with type "sagas/createOperation/request"
 */
export const createOperationsRequest = createAction(
  "sagas/createOperation/request"
);
export const createOperationsSuccess = createAction(
  "sagas/createOperation/success"
);
export const createOperationsFailure = createAction(
  "sagas/createOperation/failure"
);
