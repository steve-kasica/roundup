/**
 * @fileoverview Create tables saga action creators.
 * @module sagas/createTablesSaga/actions
 *
 * Redux action creators for table creation saga operations.
 *
 * Actions:
 * - createTablesRequest: Initiates table creation from uploaded files
 * - createTablesSuccess: Signals successful table creation in DB and state
 *
 * @example
 * import { createTablesRequest } from './actions';
 * dispatch(createTablesRequest({ tablesInfo: [{ fileName: 'data.csv', ... }] }));
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Initiates the process of creating tables from uploaded files.
 * Payload should include necessary information about the files.
 * @typedef {Object} CreateTablesRequestPayload
 * @property {Array<Object>} tablesInfo - Array of objects containing file info for table creation.
 * @example
 * {
 *   tablesInfo: [
 *     { fileName: 'data1.csv', delimiter: ',', hasHeader: true },
 *     { fileName: 'data2.csv', delimiter: ';', hasHeader: false }
 *   ]
 * }
 */
export const createTablesRequest = createAction("sagas/createTables/request");

// The successful creation of a table means that it was created in
// the database and that its corresponding object exists in state (Redux store)
export const createTablesSuccess = createAction("sagas/createTables/success");
