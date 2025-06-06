/**
 * addTableToSchemaSaga.js
 *
 * This file defines Redux Saga logic for handling the addition of a table to a schema within the application state.
 *
 * Exports:
 * - addTableToSchema: Redux action creator to trigger the saga for adding a table to a schema.
 * - addTableToSchemaSagaWatcher: Saga watcher that listens for the addTableToSchema action and invokes the worker saga.
 *
 * Main Logic:
 * - The saga worker (addTableToSchemaSagaWorker) manages the process of adding a table to the schema's operation tree.
 *   - If there is no root operation, it initializes one with a NO_OP type and adds the table as a child.
 *   - If the root operation is NO_OP, it updates the operation type and adds the new table as a child.
 *   - If the root operation matches the requested operation type, it simply adds the table as a child.
 *   - If the operation type differs, it creates a new operation and adds the table accordingly.
 *
 * This logic ensures the schema's operation tree is correctly updated as tables are added, supporting both initialization
 * and subsequent additions with proper operation type management.
 */

import { createAction } from "@reduxjs/toolkit";
import { select, takeEvery, put } from "redux-saga/effects";
import {
  addChildToOperation,
  addOperation,
  changeOperationType,
  OPERATION_TYPE_NO_OP,
  selectOperation,
  selectRootOperation,
} from "../slices/operationsSlice";

/**
 * Action creator for adding a table to a schema.
 *
 * This action is dispatched to trigger the saga responsible for handling
 * the addition of a new table to a schema in the application state. Note
 * that other sagas may also listen for this action to perform additional
 * operations, such as fetching column metadata for the newly added table.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/addTableToSchema"
 */
export const addTableToSchema = createAction("sagas/addTableToSchema");

/**
 * Saga watcher that listens for the `addTableToSchema` action and triggers the corresponding worker saga.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `addTableToSchemaSagaWorker` whenever the `addTableToSchema` action is dispatched.
 */
export default function* addTableToSchemaSagaWatcher() {
  yield takeEvery(addTableToSchema.type, addTableToSchemaSagaWorker);
}

/**
 * Saga worker to add a table to the schema
 * @param {Object} action - The action object
 * @param {string} action.payload.tableId - The ID of the table to add
 */
function* addTableToSchemaSagaWorker(action) {
  const { tableId, operationType } = action.payload;

  const rootOperationId = yield select(selectRootOperation);

  if (!rootOperationId) {
    // Initialize
    yield put(
      addOperation({ operationType: OPERATION_TYPE_NO_OP, childId: tableId })
    );
  } else {
    const rootOperation = yield select((state) =>
      selectOperation(state, rootOperationId)
    );
    if (rootOperation.operationType === OPERATION_TYPE_NO_OP) {
      // Second table added, change root operation type from NO_OP to the specified operation type
      yield put(
        changeOperationType({
          operationId: rootOperation.id,
          operationType,
        })
      );
      yield put(
        addChildToOperation({
          operationId: rootOperation.id,
          childId: tableId,
        })
      );
    } else if (rootOperation.operationType === operationType) {
      yield put(
        addChildToOperation({ operationId: rootOperation.id, tableId })
      );
    } else {
      // Different operation type, create a new operation, add it as the new root operation
      yield put(addOperation({ operationType, tableId }));
    }
  }
}
