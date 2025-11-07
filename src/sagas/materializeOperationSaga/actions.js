import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for instantiating views in the database (operations).
 *
 * This action is dispatched to trigger the instantiation of views in the state.
 * The payload should contain the view ID(s) to materialize.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/materializeOperation" and payload.
 */
export const materializeOperationRequest = createAction(
  "sagas/materializeOperation/request"
);

export const materializeOperationSuccess = createAction(
  "sagas/materializeOperation/success"
);

export const materializeOperationFailure = createAction(
  "sagas/materializeOperation/failure"
);
