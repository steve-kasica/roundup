import { createAction } from "@reduxjs/toolkit";
import { takeEvery, call, put, select } from "redux-saga/effects";
import {
  addOperation,
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  updateOperations,
} from "../../slices/operationsSlice";
import {
  addColumns,
  Column,
  COLUMN_TYPE_CATEGORICAL,
  selectColumnById,
  selectColumnIdsByTableId,
} from "../../slices/columnsSlice";
import {
  getTableDimensions,
  createStackView,
  createPackView,
  getColumnNames,
} from "../../lib/duckdb";

// Actions
export const createOperationView = createAction(
  "sagas/createOperationView/request"
);

export const createOperationViewSuccess = createAction(
  "sagas/createOperationView/success"
);

// Watcher Saga
export default function* createOperationViewSaga() {
  yield takeEvery(createOperationView.type, createOperationViewSagaWorker);
  yield takeEvery(addOperation.type, function* (action) {
    const operation = action.payload;
    yield put(createOperationView(operation.id));
  });
}

// Worker Saga
export function* createOperationViewSagaWorker(action) {
  const operationId = action.payload;
  try {
    const operation = yield select((state) =>
      selectOperation(state, operationId)
    );

    if (operation.operationType === OPERATION_TYPE_NO_OP) {
      return; // No operation view needed for NO_OP
    }

    const queryData = yield select((state) =>
      selectQueryData(state, operationId)
    );

    // Create operation view based on type
    if (operation.operationType === OPERATION_TYPE_PACK) {
      yield call(createPackOperationView, operation, queryData);
    } else if (operation.operationType === OPERATION_TYPE_STACK) {
      yield call(createStackOperationView, operation, queryData);
    } else {
      throw new Error("Unsupported operation type");
    }

    // Validate and update operation dimensions
    yield call(validateAndUpdateOperationDimensions, operationId);

    // Clear any previous errors and dispatch success
    yield call(handleOperationSuccess, operation);
  } catch (error) {
    console.error("Error creating operation view:", error);
    yield call(handleOperationError, operationId, error);
  }
}

/**
 * Creates a PACK operation view with unified columns from all child tables
 */
function* createPackOperationView(operation, queryData) {
  const { id: operationId, children } = operation;

  // Get all column IDs from all child tables and flatten them
  const oldColumns = yield select((state) => {
    const columns = children
      .map((id) => selectColumnIdsByTableId(state, id))
      .flat()
      .map((id) => selectColumnById(state, id));
    return columns;
  });

  // Create new columns for the pack operation
  const operationColumns = oldColumns.map((column, i) =>
    Column(
      operationId,
      i,
      {
        name: column.name,
        columnType: COLUMN_TYPE_CATEGORICAL, // Default to categorical for pack operation
      },
      [column.id]
    )
  );

  // Pre-add columns so they exist for the view creation
  yield put(addColumns(operationColumns));

  // Update the operation with the new column IDs
  yield put(
    updateOperations({
      id: operationId,
      columnIds: operationColumns.map((c) => c.id),
    })
  );

  // Create the pack view in the database
  yield call(
    createPackView,
    queryData,
    operationColumns.map(({ id }) => id)
  );
}

/**
 * Creates a STACK operation view using columns from the first child table
 */
function* createStackOperationView(operation, queryData) {
  const { id: operationId, children } = operation;

  // Use columns from the first child table as the template
  const childColumns = yield select((state) => {
    const columnIdMatrix = children.map((childId) => {
      const columnIds = selectColumnIdsByTableId(state, childId).map((id) =>
        selectColumnById(state, id)
      );
      return columnIds;
    });
    return columnIdMatrix;
  });

  // Create new columns for the stack operation
  // TODO: dynamically set the column type based on child columns and
  // the names
  const operationColumns = childColumns[0].map((column, i) =>
    Column(
      operationId,
      i,
      {
        name: column.name,
        columnType: COLUMN_TYPE_CATEGORICAL, // Default to categorical for stack operation
      },
      childColumns.map((row) => row[i]?.id).filter((id) => id) // child column IDs for this operation column
    )
  );

  // Pre-add columns so they exist for the view creation
  yield put(addColumns(operationColumns));

  // Update the operation with the new column IDs
  yield put(
    updateOperations({
      id: operationId,
      columnIds: operationColumns.map((c) => c.id),
    })
  );

  // Create the stack view in the database
  // TODO: Investigate why this handles NO_OP and how it doesn't break
  yield call(
    createStackView,
    queryData,
    operationColumns.map(({ id }) => id)
  );
}

/**
 * Validates operation dimensions and updates the operation with row count
 */
function* validateAndUpdateOperationDimensions(operationId) {
  // Get dimensions of the operation view
  const { rowCount, columnCount } = yield call(getTableDimensions, operationId);

  // This will throw an error if validation fails
  validateOperationDimensions(operationId, { rowCount, columnCount });

  // Update the operation with the row count
  yield put(updateOperations({ id: operationId, rowCount }));
}

/**
 * Handles successful operation creation
 */
function* handleOperationSuccess(operation) {
  const { id: operationId, operationType, error } = operation;

  // Clear any previous error if the operation was successful
  if (error) {
    yield put(updateOperations({ id: operationId, error: null }));
  }

  // Dispatch success action
  yield put(createOperationViewSuccess({ operationId, operationType }));
}

/**
 * Handles operation creation errors
 */
function* handleOperationError(operationId, error) {
  yield put(
    updateOperations({
      id: operationId,
      error: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    })
  );
}

/**
 * Selector to build query data for an operation
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
 * Helper function to validate operation dimensions
 * Throws an error if dimensions are invalid
 */
function validateOperationDimensions(operationId, dimensions) {
  if (dimensions.rowCount === 0) {
    throw new Error(
      `Operation ${operationId} has no rows. Please check the operation query.`
    );
  }

  if (dimensions.columnCount === 0) {
    throw new Error(
      `Operation ${operationId} has no columns. Please check the operation query.`
    );
  }
}
