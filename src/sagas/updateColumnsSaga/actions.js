/**
 * @fileoverview Update columns saga action creators.
 * @module sagas/updateColumnsSaga/actions
 *
 * Redux action creators for column update saga operations.
 *
 * Actions:
 * - updateColumnsRequest: Initiates column update process
 * - updateColumnsSuccess: Signals successful column updates
 * - updateColumnsFailure: Signals column update failure
 *
 * @example
 * import { updateColumnsRequest } from './actions';
 * dispatch(updateColumnsRequest({ columnUpdates: [{ id: 'col_1', columnType: 'INTEGER' }] }));
 */
import { createAction } from "@reduxjs/toolkit";

// Action types
export const updateColumnsRequest = createAction(
  "sagas/updateColumnsSaga/request"
);
export const updateColumnsSuccess = createAction(
  "sagas/updateColumnsSaga/success"
);
export const updateColumnsFailure = createAction(
  "sagas/updateColumnsSaga/failure"
);
