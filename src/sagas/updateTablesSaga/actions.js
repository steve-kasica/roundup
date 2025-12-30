/**
 * @fileoverview Update tables saga action creators.
 * @module sagas/updateTablesSaga/actions
 *
 * Redux action creators for table update saga operations.
 *
 * Actions:
 * - updateTablesRequest: Initiates table update process
 * - updateTablesSuccess: Signals successful table updates (includes changed properties)
 * - updateTablesFailure: Signals table update failure
 *
 * @example
 * import { updateTablesRequest } from './actions';
 * dispatch(updateTablesRequest({
 *   tableUpdates: [{ id: 't_1', rowCount: null }]
 * }));
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for requesting table updates.
 *
 * @param {Object} payload.tableUpdates - The data to update the table(s) with
 * @returns {Object} Redux action with type "sagas/updateTables/request"
 * @type {import('@reduxjs/toolkit')}
 */
export const updateTablesRequest = createAction("sagas/updateTables/request");

/**
 * Action creator for successful table updates.
 *
 * @param {Object} payload.changedPropertiesById - The updated properties for each table by ID
 * @returns {Object} Redux action with type "sagas/updateTables/success"
 * @type {import('@reduxjs/toolkit')}
 *
 *
 */
export const updateTablesSuccess = createAction("sagas/updateTables/success");

/**
 * Action creator for failed table updates.
 *
 * This action is dispatched when table updates fail.
 *
 */
export const updateTablesFailure = createAction("sagas/updateTables/failure");
