/**
 * @fileoverview Delete operations saga action creators.
 * @module sagas/deleteOperationsSaga/actions
 *
 * Redux action creators for operation deletion saga operations.
 *
 * Actions:
 * - deleteOperationsRequest: Initiates operation deletion process
 * - deleteOperationsSuccess: Signals successful operation deletion
 * - deleteOperationsFailure: Signals operation deletion failure
 *
 * @example
 * import { deleteOperationsRequest } from './actions';
 * dispatch(deleteOperationsRequest({ operationIds: ['op_1', 'op_2'] }));
 */
import { createAction } from "@reduxjs/toolkit";

export const deleteOperationsRequest = createAction(
  "sagas/deleteOperations/request"
);
export const deleteOperationsSuccess = createAction(
  "sagas/deleteOperations/success"
);
export const deleteOperationsFailure = createAction(
  "sagas/deleteOperations/failure"
);
