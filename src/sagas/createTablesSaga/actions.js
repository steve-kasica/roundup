import { createAction } from "@reduxjs/toolkit";

export const createTablesRequest = createAction("sagas/createTables/request");
export const createTablesSuccess = createAction("sagas/createTables/success");
export const createTablesFailure = createAction("sagas/createTables/failure");
