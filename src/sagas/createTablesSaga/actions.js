import { createAction } from "@reduxjs/toolkit";

export const createTablesRequest = createAction("sagas/createTables/request");

// The successful creation of a table means that it was created in
// the database and that its corresponding object exists in state (Redux store)
export const createTablesSuccess = createAction("sagas/createTables/success");

// The failed creation of a table means that the attempt to create it
// in the database failed, but its corresponding object still exists in state
// (Redux store)
export const createTablesFailure = createAction("sagas/createTables/failure");
