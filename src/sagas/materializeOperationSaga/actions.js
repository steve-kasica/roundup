/**
 * @fileoverview Materialize operation saga action creators.
 * @module sagas/materializeOperationSaga/actions
 *
 * Redux action creators for materializing database views from operations.
 *
 * Actions:
 * - materializeOperationRequest: Initiates view materialization
 * - materializeOperationSuccess: Signals successful view creation
 * - materializeOperationFailure: Signals view creation failure
 *
 * @example
 * import { materializeOperationRequest } from './actions';
 * dispatch(materializeOperationRequest({ operationId: 'op_1' }));
 */
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
