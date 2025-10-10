import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for requesting table updates.
 *
 * This action is dispatched to trigger the saga responsible for handling
 * table updates in the application state.
 *
 * @function
 * @param {Object} payload - The payload containing table update information
 * @param {string|string[]} payload.tableIds - The ID(s) of the table(s) to update
 * @param {Object} payload.updateData - The data to update the table(s) with
 * @returns {Object} Redux action with type "sagas/updateTables/request"
 */
export const updateTablesRequest = createAction("sagas/updateTables/request");

/**
 * Action creator for successful table updates.
 *
 * This action is dispatched when table updates complete successfully.
 *
 * @function
 * @param {Object} payload - The payload containing successful update information
 * @returns {Object} Redux action with type "sagas/updateTables/success"
 */
export const updateTablesSuccess = createAction("sagas/updateTables/success");

/**
 * Action creator for failed table updates.
 *
 * This action is dispatched when table updates fail.
 *
 * @function
 * @param {Object} payload - The payload containing error information
 * @param {string} payload.error - The error message
 * @returns {Object} Redux action with type "sagas/updateTables/failure"
 */
export const updateTablesFailure = createAction("sagas/updateTables/failure");
