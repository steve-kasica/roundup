import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for deleting tables.
 *
 * This action is dispatched to trigger the removal of tables from the state.
 * The payload should contain the table ID(s) to remove.
 *
 * @function
 * @param {Object} payload - The payload containing table ID(s) to delete.
 * @param {Array<string>} payload.tableIds - Array of table IDs to be deleted.
 * @returns {Object} Redux action with type "sagas/deleteTables" and payload.
 */
export const deleteTablesRequest = createAction("sagas/deleteTables/request");

export const deleteTablesSuccess = createAction("sagas/deleteTables/success");

export const deleteTablesFailure = createAction("sagas/deleteTables/failure");
