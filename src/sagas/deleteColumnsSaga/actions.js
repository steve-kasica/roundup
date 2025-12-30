/**
 * @fileoverview Delete columns saga action creators.
 * @module sagas/deleteColumnsSaga/actions
 *
 * Redux action creators for column deletion saga operations.
 *
 * Actions:
 * - deleteColumnsRequest: Initiates column deletion process
 * - deleteColumnsSuccess: Signals successful column deletion
 * - deleteColumnsFailure: Signals column deletion failure
 *
 * @example
 * import { deleteColumnsRequest } from './actions';
 * dispatch(deleteColumnsRequest({ columnIds: ['col_1', 'col_2'] }));
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for removing columns.
 *
 * This action is dispatched to trigger the removal of columns from the state.
 * The payload should contain information about which columns to delete.
 *
 * @function
 * @param {Object} payload - The payload for the action.
 * @param {Array|string} payload.columnIds - An array of column IDs or a single column ID to be deleted.
 * @returns {Object} Redux action with type "sagas/deleteColumn" and payload.
 */
export const deleteColumnsRequest = createAction("sagas/deleteColumns/request");

export const deleteColumnsSuccess = createAction("sagas/deleteColumns/success");

export const deleteColumnsFailure = createAction("sagas/deleteColumns/failure");
