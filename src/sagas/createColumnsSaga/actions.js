/**
 * @fileoverview Create columns saga action creators.
 * @module sagas/createColumnsSaga/actions
 *
 * Redux action creators for column creation saga operations.
 *
 * Actions:
 * - createColumnsRequest: Initiates column creation process
 * - createColumnsSuccess: Signals successful column creation
 * - createColumnsFailure: Signals column creation failure
 *
 * @example
 * import { createColumnsRequest } from './actions';
 * dispatch(createColumnsRequest({ columnLocations: [...], mode: 'insertion' }));
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for initiating the create columns request saga.
 * Dispatch this action to trigger the process of creating columns.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/createColumns/request"
 */
export const createColumnsRequest = createAction("sagas/createColumns/request");

/**
 * Action creator for successful creation of columns.
 *
 * Dispatched when the columns are successfully created in the saga.
 *
 * @type {import('@reduxjs/toolkit').ActionCreatorWithPayload<any>}
 */
export const createColumnsSuccess = createAction("sagas/createColumns/success");

/**
 * Action creator for handling failure in the createColumns saga.
 * Dispatched when the createColumns process encounters an error.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/createColumns/failure"
 */
export const createColumnsFailure = createAction("sagas/createColumns/failure");
