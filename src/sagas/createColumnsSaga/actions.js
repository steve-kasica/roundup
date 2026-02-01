/**
 * @fileoverview Create columns saga action creators.
 * @module sagas/createColumnsSaga/actions
 *
 * Redux action creators for column creation saga operations.
 *
 */
import { createAction } from "@reduxjs/toolkit";

/**
 * Action creator for initiating the create columns request saga.
 * Dispatch this action to trigger the process of creating columns.
 *
 * @function
 * @param {Array<Object>} payload - Array of column creation data objects.
 *
 * @returns {Object} Redux action with type "sagas/createColumns/request"
 *
 */
export const createColumnsRequest = createAction("sagas/createColumns/request");

/**
 * Action creator for initiating the insert columns request saga.
 * Dispatch this action to trigger the process of inserting columns.
 *
 * @function
 * @param {Array<Object>} payload - Array of column insertion data objects.
 * @returns {Object} Redux action with type "sagas/createColumns/insertRequest"
 *
 *  * @example
 * dispatch(insertColumnsRequest([
 *   { parentId: 'table1', index: 0, name: 'New Column', fillValue: null },
 *   { parentId: 'operation1', index: 2, name: 'Another Column', fillValue: 0 },
 * ]));
 */
export const insertColumnsRequest = createAction(
  "sagas/createColumns/insertRequest",
);

/**
 * Action creator for successful creation of columns.
 *
 * Dispatched when the columns are successfully created in the saga.
 *
 * @type {import('@reduxjs/toolkit').ActionCreatorWithPayload<any>}
 */
export const createColumnsSuccess = createAction("sagas/createColumns/success");
