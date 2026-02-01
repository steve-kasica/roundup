/**
 * @fileoverview Delete tables saga action creators.
 * @module sagas/deleteTablesSaga/actions
 *
 * Redux action creators for table deletion saga operations.
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for deleting tables.
 *
 * This action is dispatched to trigger the removal of tables from the state.
 * The payload should contain the table ID(s) to remove.
 *
 * @function
 * @param {Array<string>} payload - The payload containing table ID(s) to delete.
 *      ['t1', 't2', ...]
 * @returns {Object} Redux action with type "sagas/deleteTables" and payload.
 */
export const deleteTablesRequest = createAction("sagas/deleteTables/request");

/**
 * Action creator for successful table deletion.
 *
 * This action is dispatched when tables have been successfully deleted.
 * The payload contains the details of the deleted tables.
 *
 * @function
 * @param {Object} payload - The payload containing details of deleted tables.
 * @param {Array<Object>} payload.tables - Array of deleted table objects.
 *      { id: string, name: string, databaseName: string, ... }
 * @returns {Object} Redux action with type "sagas/deleteTables/success" and payload.
 */
export const deleteTablesSuccess = createAction("sagas/deleteTables/success");
