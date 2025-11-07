import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for instantiating views in the database (operations).
 *
 * This action is dispatched to trigger the instantiation of views in the state.
 * The payload should contain the view ID(s) to instantiate.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/instantiateViewSaga" and payload.
 */
export const instantiateViewRequest = createAction(
  "sagas/instantiateView/request"
);

export const instantiateViewSuccess = createAction(
  "sagas/instantiateView/success"
);

export const instantiateViewFailure = createAction(
  "sagas/instantiateView/failure"
);
