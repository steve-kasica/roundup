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
 * @param {Array<Object>} payload - The data to update the table(s) with
 *  *  e.g. [{ id: 't1', rowCount: null, columnIds: [...] }, ...]
 *
 * @returns {Object} Redux action with type "sagas/updateTables/request"
 * @type {import('@reduxjs/toolkit')}
 */
export const updateTablesRequest = createAction("sagas/updateTables/request");

/**
 * Action creator for successful table updates.
 *
 * @param {Array<Object>} payload - The updated properties for each table by ID
 *  e.g. [{ id: 't1', rowCount: 100, columnIds: [...] }, ...]
 * @returns {Object} Redux action with type "sagas/updateTables/success"
 * @type {import('@reduxjs/toolkit')}
 *
 *
 */
export const updateTablesSuccess = createAction("sagas/updateTables/success");
