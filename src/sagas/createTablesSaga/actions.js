/**
 * @fileoverview Create tables saga action creators.
 * @module sagas/createTablesSaga/actions
 *
 * Redux action creators for table creation saga operations.
 *
 * Actions:
 * - createTablesRequest: Initiates table creation from uploaded files
 * - createTablesSuccess: Signals successful table creation in DB and state
 * - createTablesFailure: Signals table creation failure (DB failed, state exists)
 *
 * @example
 * import { createTablesRequest } from './actions';
 * dispatch(createTablesRequest({ tablesInfo: [{ fileName: 'data.csv', ... }] }));
 */
import { createAction } from "@reduxjs/toolkit";

export const createTablesRequest = createAction("sagas/createTables/request");

// The successful creation of a table means that it was created in
// the database and that its corresponding object exists in state (Redux store)
export const createTablesSuccess = createAction("sagas/createTables/success");

// The failed creation of a table means that the attempt to create it
// in the database failed, but its corresponding object still exists in state
// (Redux store)
export const createTablesFailure = createAction("sagas/createTables/failure");
