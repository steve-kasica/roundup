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
