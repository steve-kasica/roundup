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

/**
 * Action creator for successful operation updates.
 *
 * @param {Object} payload.changedPropertiesByOperationId - A mapping of operation IDs to the properties that were changed
 * e.g. `{ "operationId1": ["property1", "property2"], "operationId2": ["property3"] }`
 * @returns {Object} Redux action with type "sagas/updateOperations/success"
 * @type {import('@reduxjs/toolkit').ActionCreatorWithPayload}
 */
export const updateOperationsSuccess = createAction(
  "sagas/updateOperations/success"
);

export const updateOperationsFailure = createAction(
  "sagas/updateOperations/failure"
);
