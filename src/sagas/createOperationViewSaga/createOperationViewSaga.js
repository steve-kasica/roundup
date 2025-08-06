import { createAction } from "@reduxjs/toolkit";
import { takeEvery, call, put, select } from "redux-saga/effects";
import {
  clearOperationError,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  setOperationAttributes,
  setOperationError,
  updateOperationJoinSpec,
  updateOperations,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { addTableToSchemaSuccess } from "../addTableToSchemaSaga/addTableToSchemaSaga";
import { selectColumnById } from "../../slices/columnsSlice";
import { removeColumnsSuccessAction } from "../removeColumnsSaga";
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
  // After a table is added to the schema, create or update an operation view
  yield takeEvery(addTableToSchemaSuccess.type, function* (action) {
    const { tableId } = action.payload;
    const table = yield select((state) => selectTablesById(state, tableId));
    yield handleCreateOperationView(table.operationId);
  });

  // After columns are removed, update the operation view if the table has one
  yield takeEvery(removeColumnsSuccessAction.type, function* (action) {
    const columnIds = action.payload;
    const table = yield select((state) => {
      const column = selectColumnById(state, columnIds[0]);
      return selectTablesById(state, column.tableId);
    });

    if (table.operationId) {
      yield handleCreateOperationView(table.operationId);
    }
  });

  yield takeEvery(updateOperations.type, function* (action) {
    const dependentProps = ["joinSpec"]; // TODO: expand this
    const operations = Array.isArray(action.payload)
      ? action.payload
      : action.payload.operations || [action.payload];

    for (const updatedOperationProps of operations) {
      if (
        Object.keys(updatedOperationProps).some((key) =>
          dependentProps.includes(key)
        )
      ) {
        yield handleCreateOperationView(updatedOperationProps.id);
      }
    }
  });

  // If the specification of an PACK operation is updated, create or update the operation view
  // in DuckDB
  yield takeEvery(updateOperationJoinSpec.type, function* (action) {
    const { id } = action.payload;
    yield handleCreateOperationView(id);
  });
}

// Helper function to validate operation dimensions
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

// Worker Saga
function* handleCreateOperationView(operationId) {
  try {
    const operation = yield select((state) =>
      selectOperation(state, operationId)
    );
    const queryData = yield select((state) =>
      selectQueryData(state, operationId)
    );

    // createStackView execute a view creation/update query
    if (operation.operationType === OPERATION_TYPE_PACK) {
      yield call(createPackView, queryData);
    } else {
      // includes stack and NO_OP
      // TODO: why does it do NO_OP and how does it not break?
      yield call(createStackView, queryData);
    }

    // Get dimensions of the operation view
    // This will throw an error if the operation has no rows or columns
    const dimensions = yield call(getTableDimensions, operationId);
    validateOperationDimensions(operationId, dimensions);
    yield put(
      setOperationAttributes({
        id: operationId,
        attributes: { ...dimensions },
      })
    );

    // Get column names for the operation view if they are not already set
    if (operation.columnNames.length === 0) {
      // If the operation has no column names, fetch them from the DuckDB view
      const columnIds = yield call(getColumnNames, operationId);
      const columnNames = yield select((state) =>
        columnIds.map((id) => selectColumnById(state, id).name)
      );
      yield put(
        setOperationAttributes({
          id: operationId,
          attributes: { columnNames },
        })
      );
    }

    if (operation.error) {
      // Clear any previous error if the operation was successful
      yield put(clearOperationError({ operationId }));
    }

    yield put(
      createOperationViewSuccess({
        operationId,
        operationType: operation.operationType,
      })
    );
  } catch (error) {
    console.warn("Error creating operation view:", error);
    yield put(
      setOperationError({
        operationId,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)), // Serialize the error
      })
    );
  }
}

// TODO: this would be like a serialize operation query selector in the operations slice
const selectQueryData = (state, operationId) => {
  const operation = selectOperation(state, operationId);
  const parent = { ...operation };
  parent.children = operation.children.map((id) => {
    let child = { id, columnIds: [] };
    if (isTableId(id)) {
      child.columnIds = state.columns.idsByTable[id];
    } else {
      child.columnIds = ["*"];
    }
    return child;
  });
  return parent;
};
