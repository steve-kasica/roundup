/**
 * @fileoverview Create operations saga action creators.
 * @module sagas/createOperationsSaga/actions
 *
 * Redux action creators for operation creation saga operations.
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creators for creating operations.
 *
 * @param {Array} payload - The data to create the operation(s) with
 * @param {string} payload[].operationType - The type of operation to create
 * @param {Array<string>} payload[].childIds - The IDs of child objects for the operation
 * @returns {Object} Redux action with type "sagas/createOperation/request"
 *
 * @example
 * import { createOperationsRequest } from './actions';
 * dispatch(createOperationsRequest([
 *   {
 *     operationType: 'PACK',
 *     childIds: ['t_1', 't_2']
 *   }
 * ]));
 */
export const createOperationsRequest = createAction(
  "sagas/createOperation/request",
);

/**
 * Action creator for successful operation creation.
 *
 * @param {Array} payload - The created operation objects
 * @returns {Object} Redux action with type "sagas/createOperation/success"
 */
export const createOperationsSuccess = createAction(
  "sagas/createOperation/success",
);
