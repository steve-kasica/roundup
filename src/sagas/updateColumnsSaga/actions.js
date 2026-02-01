/**
 * @fileoverview Update columns saga action creators.
 * @module sagas/updateColumnsSaga/actions
 *
 * Redux action creators for column update saga operations.
 *
 * Actions:
 * - updateColumnsRequest: Initiates column update process
 * - updateColumnsSuccess: Signals successful column updates
 *
 * @example
 * import { updateColumnsRequest } from './actions';
 * dispatch(updateColumnsRequest({ columnUpdates: [{ id: 'col_1', columnType: 'INTEGER' }] }));
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for initiating column update requests.
 *
 * @function
 * @param {Array<Object>} payload - Array of column update objects.
 * Each object should contain:
 *   - id: {string} Column identifier.
 * @returns {Object} Redux action.
 *
 * @example
 * import { updateColumnsRequest } from './actions';
 * dispatch(updateColumnsRequest([{ id: 'col_1', columnType: 'INTEGER' }]));
 */
export const updateColumnsRequest = createAction(
  "sagas/updateColumnsSaga/request",
);

/**
 * Action creator for handling column update success.
 *
 * @function
 * @param {Array<Object>} payload - Array of updated column objects.
 * @returns {Object} Redux action.
 */

export const updateColumnsSuccess = createAction(
  "sagas/updateColumnsSaga/success",
);
