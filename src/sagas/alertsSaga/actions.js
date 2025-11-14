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
