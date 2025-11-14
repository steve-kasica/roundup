import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for requesting operation updates.
 *
 * @param {Object} payload.operationUpdates - The data to update the operation(s) with
 * @returns {Object} Redux action with type "sagas/updateOperations/request"
 * @type {import('@reduxjs/toolkit')}
 */
export const updateOperationsRequest = createAction(
  "sagas/updateOperations/request"
);

export const updateOperationsSuccess = createAction(
  "sagas/updateOperations/success"
);

export const updateOperationsFailure = createAction(
  "sagas/updateOperations/failure"
);
