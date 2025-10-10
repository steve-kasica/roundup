import { createAction } from "@reduxjs/toolkit";

// Action creators for view creation workflow
export const createOperationsRequest = createAction(
  "sagas/createOperation/request"
);
export const createOperationsSuccess = createAction(
  "sagas/createOperation/success"
);
export const createOperationsFailure = createAction(
  "sagas/createOperation/failure"
);
