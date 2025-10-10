import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for removing columns.
 *
 * This action is dispatched to trigger the removal of columns from the state.
 * The payload should contain information about which columns to delete.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/deleteColumn" and payload.
 */
export const deleteColumnsRequest = createAction("sagas/deleteColumns/request");

export const deleteColumnsSuccess = createAction("sagas/deleteColumns/success");

export const deleteColumnsFailure = createAction("sagas/deleteColumns/failure");
