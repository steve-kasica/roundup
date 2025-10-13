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
  selectOperation,
  setFocusedOperation,
} from "../../slices/operationsSlice";
import {
  createStackView,
  createPackView,
  getTableDimensions,
} from "../../lib/duckdb";
import { createOperationsSuccess, createOperationsFailure } from "./actions";
import Operation from "../../slices/operationsSlice/Operation";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";

const calcPackColumnCount = (childIds) => {
  const columnCounts = childIds.map((childId) => {
    if (isTableId(childId)) {
      const table = select((state) => selectTablesById(state, [childId])[0]);
      return table ? table.columnIds.length : 0;
    } else {
      const operation = select((state) => selectOperation(state, childId));
      return operation ? operation.columnIds.length : 0;
    }
  });
  const columnCountTotal = columnCounts.reduce((sum, count) => sum + count, 0);
  return columnCountTotal;
};

const calcStackColumnCount = (childIds) => {
  let maxColumns = 0;
  for (const childId of childIds) {
    if (isTableId(childId)) {
      const table = select((state) => selectTablesById(state, [childId])[0]);
      if (table && table.columnIds.length > maxColumns) {
        maxColumns = table.columnIds.length;
      }
    } else {
      const operation = select((state) => selectOperation(state, childId));
      if (operation && operation.columnIds.length > maxColumns) {
        maxColumns = operation.columnIds.length;
      }
    }
  }
  return maxColumns;
};

/**
 * Selector to build query data for an operation.
 * Constructs the data structure needed for database view creation.
 *
 * @param {Object} state - Redux state
 * @param {string} operationId - ID of the operation to build query data for
 * @returns {Object} Query data object with operation details and child table information
 *
 * TODO: This could be moved to a selector in the operations slice
 */
export const selectQueryData = (state, operationId) => {
  const operation = selectOperation(state, operationId);
  const parent = { ...operation };
  parent.children = operation.children.map((id) => {
    let child = { id, columnIds: state.columns.idsByTable[id] };
    return child;
  });
  return parent;
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
    // Add operation to store
    try {
      // Create database view based on operation type
      if (operation.operationType === OPERATION_TYPE_PACK) {
        // Build query data structure required for view creation
        const queryData = yield select((state) =>
          selectQueryData(state, operation.id)
        );
        // Creates a unified view with columns from all child tables
        yield call(createPackView, queryData, operation.columnIds);
        const { rowCount, columnCount } = yield call(
          getTableDimensions,
          operation.id
        );
        operation.rowCount = rowCount;
        operation.initialColumnCount = columnCount;
      } else if (operation.operationType === OPERATION_TYPE_STACK) {
        // Creates a stacked view using the first child table as template
        // Build query data structure required for view creation
        const queryData = yield select((state) =>
          selectQueryData(state, operation.id)
        );
        yield call(createStackView, queryData, operation.columnIds);
        const { rowCount, columnCount } = yield call(
          getTableDimensions,
          operation.id
        );
        operation.rowCount = rowCount;
        operation.initialColumnCount = columnCount;
      }
      // Do nothing for NO_OP operations

      successfulCreations.push(operation);
    } catch (error) {
      console.error(
        `Error creating database view for operation ${operation.id}:`,
        error
      );
      operation.rowCount = undefined;
      operation.initialColumnCount =
        operation.operationType === OPERATION_TYPE_PACK
          ? calcPackColumnCount(childIds)
          : calcStackColumnCount(childIds);
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
    setFocusedOperation(combinedOperations[combinedOperations.length - 1].id)
  );

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
