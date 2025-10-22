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

import { call, put, select } from "redux-saga/effects";
import {
  addOperations as addOperationsToSlice,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import Operation from "../../slices/operationsSlice/Operation";
import { createOperationsSuccess, createOperationsFailure } from "./actions";
import {
  createStackView,
  createPackView,
  getTableDimensions,
} from "../../lib/duckdb";

import { group } from "d3";
import { selectActiveColumnIdsByTableId } from "../../slices/columnsSlice";
import { selectOperationQueryData } from "../../slices/operationsSlice/operationsSelectors";
import { setFocusedObject } from "../../slices/uiSlice";

export const calcPackColumnCount = (state, childIds) => {
  const columnCountTotal = childIds.reduce(
    (total, id) => selectActiveColumnIdsByTableId(state, id).length + total,
    0
  );

  return columnCountTotal;
};

export const calcStackColumnCount = (state, childIds) => {
  const tableColumnCounts = Array.from(
    group(
      group(
        Object.values(state.columns.data).filter(({ tableId }) =>
          childIds.includes(tableId)
        ),
        (column) => column.tableId
      )
    ),
    ([tableId, columns]) => columns.length
  );
  const maxColumns = Math.max(0, ...tableColumnCounts);
  return maxColumns;
};

/**
 * Worker saga that creates or replaces database views based on operation type.
 *
 * This function is the core of the view creation process. It:
 * 1. Determines the operation type (PACK, STACK, or NO_OP)
 * 2. Calls the appropriate database view creation function
 * 3. Creates or replaces the existing view in the database
 * 4. Updates operation state with success/failure information
 *
 * Database View Creation Behavior:
 * - PACK operations: Creates a unified view combining all child table columns
 * - STACK operations: Creates a stacked view using first child table as template
 * - NO_OP operations: Skips view creation (no database changes needed)
 *
 * Error Handling:
 * - Failed view creation updates the operation with error details
 * - Successful creation clears any previous errors
 * - Database errors are logged and stored in operation state
 *
 * @generator
 * @param {Object} action - Redux action containing the operation ID
 * @param {string} action.payload - The operation ID to create a view for
 * @yields {Effect} Various saga effects for database operations and state updates
 */
export default function* createOperationsWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  let { operationData } = action.payload;

  operationData = Array.isArray(operationData)
    ? operationData
    : [operationData];

  for (const { operationType, childIds } of operationData) {
    // Create operation object
    const operation = Operation(operationType, childIds);

    // Build query data structure required for view creation
    const queryData = yield select((state) =>
      selectOperationQueryData(state, operation)
    );

    try {
      // Create database view based on operation type
      if (operation.operationType === OPERATION_TYPE_PACK) {
        // Creates a unified view with columns from all child tables
        yield call(createPackView, queryData);
        const { rowCount, columnCount } = yield call(
          getTableDimensions,
          operation.id
        );
        operation.rowCount = rowCount;
        operation.columnCount = columnCount; // initial column count
      } else if (operation.operationType === OPERATION_TYPE_STACK) {
        // Creates a stacked view using the first child table as template
        yield call(createStackView, queryData);
        const { rowCount, columnCount } = yield call(
          getTableDimensions,
          operation.id
        );
        operation.rowCount = rowCount;
        operation.columnCount = columnCount; // initial column count
      }
      // Do nothing for NO_OP operations

      successfulCreations.push(operation);
    } catch (error) {
      console.error(
        `Error creating database view for operation ${operation.id}:`,
        error
      );
      operation.rowCount = undefined; // TODO: this is calculatable
      operation.columnCount = yield select((state) =>
        operation.operationType === OPERATION_TYPE_PACK
          ? calcPackColumnCount(state, childIds)
          : calcStackColumnCount(state, childIds)
      );

      operation.error = JSON.stringify(
        error,
        Object.getOwnPropertyNames(error)
      );
      failedCreations.push(operation);
    }
  }

  const combinedOperations = [...successfulCreations, ...failedCreations];

  yield put(addOperationsToSlice(combinedOperations));
  yield put(
    setFocusedObject(combinedOperations[combinedOperations.length - 1].id)
  ); // focus the last operation created

  if (successfulCreations.length > 0) {
    yield put(
      createOperationsSuccess({
        operationIds: successfulCreations.map((op) => op.id),
      })
    );
  }
  if (failedCreations.length > 0) {
    yield put(
      createOperationsFailure({
        operationIds: failedCreations.map((op) => op.id),
      })
    );
  }
}
