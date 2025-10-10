import { createAction } from "@reduxjs/toolkit";

export const deleteOperationsRequest = createAction(
  "sagas/deleteOperations/request"
);
export const deleteOperationsSuccess = createAction(
  "sagas/deleteOperations/success"
);
export const deleteOperationsFailure = createAction(
  "sagas/deleteOperations/failure"
);
