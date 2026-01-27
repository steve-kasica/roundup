/**
 * createOperationsSaga.js
 *
 * This saga manages the creation and replacement of database views based on operation types.
 * It automatically creates or replaces views in the DuckDB database when operations are added
 * or modified, ensuring the database state stays synchronized with the application's operation tree.
 *
 * Main Functionality:
 * - Creates database views for PACK and STACK operations
 * - Replaces existing views when operations are updated
 * - Handles view creation errors gracefully by updating operation state
 * - Automatically triggers when new operations are added to the store
 *
 * Supported Operation Types:
 * - PACK: Creates a unified view with columns from all child tables
 * - STACK: Creates a stacked view using the first child table as template
 * - NO_OP: Skips view creation (no database view needed)
 *
 * Database View Behavior:
 * - Views are created with the operation ID as the view name
 * - If a view already exists with the same name, it is replaced
 * - Views provide a unified interface to query across multiple tables
 * - Failed view creation updates the operation with error information
 *
 * Exports:
 * - createOperation: Action to manually trigger view creation for an operation
 * - createOperationsSuccess: Action dispatched when view creation succeeds
 * - createOperationsFailure: Action dispatched when view creation fails
 * - createOperationsSaga: Main watcher saga that handles view creation workflows
 */

import { put } from "redux-saga/effects";
import {
  addOperations as addOperationsToSlice,
  updateOperations as updateOperationsSlice,
  Operation,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { createOperationsSuccess } from "./actions";
import { setFocusedObjectId } from "../../slices/uiSlice";
import { normalizeInputToArray } from "../../slices/utilities";
import generateUUID from "../../lib/utilities/generateUUID";
import {
  isTableId,
  updateTables as updateTablesSlice,
} from "../../slices/tablesSlice";

/**
 * Worker saga that creates or replaces database views based on operation type.
 *
 *
 * @generator
 * @param {Object} action - Redux action containing the operation ID
 * @param {string} action.payload - The operation ID to create a view for
 * @yields {Effect} Various saga effects for database operations and state updates
 */
export default function* createOperationsWorker(action) {
  const createdOperations = [];
  const tableUpdates = [];
  const operationUpdates = [];
  let { operationData } = action.payload;

  operationData = normalizeInputToArray(operationData);

  for (const { operationType, childIds } of operationData) {
    // Create operation object
    const operation = Operation({
      operationType,
      childIds,
      databaseName: `${generateUUID("o_")}`,
    });

    createdOperations.push(operation);

    childIds.forEach((childId) => {
      if (isTableId(childId)) {
        tableUpdates.push({
          id: childId,
          parentId: operation.id,
        });
      } else {
        operationUpdates.push({
          id: childId,
          parentId: operation.id,
        });
      }
    });
  }

  yield put(addOperationsToSlice(createdOperations));
  yield put(updateTablesSlice(tableUpdates));
  yield put(updateOperationsSlice(operationUpdates));

  const lastOperation = createdOperations[createdOperations.length - 1];

  if (lastOperation.operationType === OPERATION_TYPE_NO_OP) {
    yield put(setFocusedObjectId(lastOperation.childIds[0])); // focus the table of the NO_OP operation
  } else {
    yield put(setFocusedObjectId(lastOperation.id)); // focus the last operation created
  }

  yield put(
    createOperationsSuccess({
      operationIds: createdOperations.map((op) => op.id),
    }),
  );
}
