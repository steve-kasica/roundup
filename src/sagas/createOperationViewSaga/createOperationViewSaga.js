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

  // If the specification of an PACK operation is updated, create or update the operation view
  // in DuckDB
  yield takeEvery(updateOperationJoinSpec.type, function* (action) {
    const { id } = action.payload;
    yield handleCreateOperationView(id);
  });
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

    const dimensions = yield call(getTableDimensions, operationId);

    if (dimensions.rowCount === 0) {
      throw new Error(
        `Operation ${operationId} has no rows. Please check the operation query.`
      );
    } else if (dimensions.columnCount === 0) {
      throw new Error(
        `Operation ${operationId} has no columns. Please check the operation query.`
      );
    }

    // const columnNames = yield call(getColumnNames, operationId);

    yield put(
      setOperationAttributes({
        id: operationId,
        attributes: { ...dimensions },
      })
    );

    if (operation.error) {
      // Clear any previous error if the operation was successful
      yield put(clearOperationError({ operationId }));
    }
  } catch (error) {
    console.error("Error creating operation view:", error);
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
