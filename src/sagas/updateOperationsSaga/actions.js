import { createAction } from "@reduxjs/toolkit";

// Action Types
export const updateOperationsRequest = createAction(
  "sagas/updateOperations/request"
);

export const updateNoOpOperationRequest = createAction(
  "sagas/updateOperations/request/noop"
);

export const updateOperationsSuccess = createAction(
  "sagas/updateOperations/success"
);

export const updateOperationsFailure = createAction(
  "sagas/updateOperations/failure"
);
