/**
 * @fileoverview Alert saga action creators.
 * @module sagas/alertsSaga/actions
 *
 * Redux action creators for triggering alert-related saga operations.
 *
 * Actions:
 * - updateAlertsRequest: Triggers full alert recalculation
 * - checkOperationForAlertsRequest: Checks specific operations for alerts
 *
 * @example
 * import { checkOperationForAlertsRequest } from './actions';
 * dispatch(checkOperationForAlertsRequest({ operationIds: ['op_1'] }));
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for initiating the create columns request saga.
 * Dispatch this action to trigger the process of creating columns.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/createColumns/request"
 */
export const updateAlertsRequest = createAction("sagas/updateAlerts/request");

export const checkOperationForAlertsRequest = createAction(
  "sagas/checkOperationForAlerts/request"
);
