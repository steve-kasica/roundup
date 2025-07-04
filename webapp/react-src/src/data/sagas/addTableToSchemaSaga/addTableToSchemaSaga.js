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
} from "../../slices/operationsSlice";
import Operation from "../../slices/operationsSlice/Operation";
import {
  isTableId,
  selectTablesById,
  setTablesAttribute,
} from "../../slices/tablesSlice";

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

export const addTableToSchemaSuccess = createAction(
  "sagas/addTableToSchemaSuccess"
);

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
 * Saga worker to handle the logic of when a user adds a table to the schema.
 * It should handle initialization of the operation tree if it does not exist,
 * and manage the addition of the table to the appropriate operation based on its type.
 * @param {Object} action - The action object
 * @param {string} action.payload.tableId - The ID of the table to add
 */
export function* addTableToSchemaSagaWorker(action) {
  const { tableId, operationType } = action.payload;

  const rootOperationId = yield select(selectRootOperation);
  const rootOperation = yield select((state) =>
    rootOperationId ? selectOperation(state, rootOperationId) : null
  );

  if (!rootOperationId) {
    // Case: initialization
    const operation = Operation(OPERATION_TYPE_NO_OP, [tableId]);
    yield put(addOperation(operation));
    yield put(
      setTablesAttribute({
        ids: tableId,
        attribute: "operationId",
        value: operation.id,
      })
    );
  } else if (rootOperation.operationType === OPERATION_TYPE_NO_OP) {
    // Case: table added after initialization

    // Change root operation type from NO_OP to the specified operation type
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
    yield put(
      setTablesAttribute({
        ids: tableId,
        attribute: "operationId",
        value: rootOperation.id,
      })
    );
  } else if (rootOperation.operationType === operationType) {
    // Case: table added to an existing operation of the same type

    // Add the table as a child of the existing operation
    yield put(
      addChildToOperation({ operationId: rootOperation.id, childId: tableId })
    );
    yield put(
      setTablesAttribute({
        ids: tableId,
        attribute: "operationId",
        value: rootOperation.id,
      })
    );
  } else {
    // Case: table added to an existing operation of a different type

    // Create a new root operation
    const operation = Operation(operationType, [tableId]);
    yield put(addOperation(operation));
    yield put(
      setTablesAttribute({
        ids: tableId,
        attribute: "operationId",
        value: operation.id,
      })
    );
  }

  yield put(addTableToSchemaSuccess(action.payload));
}
