import { createAction } from "@reduxjs/toolkit";

export const createColumnsRequest = createAction("sagas/createColumns/request");
export const createColumnsSuccess = createAction("sagas/createColumns/success");
export const createColumnsFailure = createAction("sagas/createColumns/failure");
